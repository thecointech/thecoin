import { ethers, Wallet } from 'ethers';
import TheCoinSpec from '@the-coin/contract/build/contracts/TheCoin.json';

import RopstenDeployment from '@the-coin/contract/zos.ropsten.json';

import { BrokerCAD } from "@the-coin/types/lib/brokerCAD";

const { abi } = TheCoinSpec;
// NOTE: When changing from Ropsten to Mainnet, update
// address, provider, and InitialCoinBlock below.
const { address } = RopstenDeployment.proxies["the-contract/TheCoin"][0];
const ropsten = ethers.getDefaultProvider('ropsten');

const theContract = new ethers.Contract(address, abi, ropsten);

export function GetContract() { return theContract; };

export function GetConnected(wallet: Wallet) {
	if (wallet.connect == null)
		return null;
	const provider = theContract.provider;
	const connectedWallet = wallet.connect(provider);
	return theContract.connect(connectedWallet);
}

export function ParseSignedMessage(signedMessage: BrokerCAD.SignedMessage) {
	return [
		ethers.utils.verifyMessage(signedMessage.message, signedMessage.signature),
		JSON.parse(signedMessage.message)
	];
}

// ---------------------------------------------------------\\

function GetHash(from: string, to: string, value: number, fee: number, timestamp: number) {
	const ethersHash = ethers.utils.solidityKeccak256(
		["address", "address", "uint256", "uint256", "uint256"],
		[from, to, value, fee, timestamp]
	);
	return ethers.utils.arrayify(ethersHash)
}

export async function SignVerifiedXfer(from: Wallet, to: string, value: number, fee: number, timestamp: number) {
	const hash = GetHash(from.address, to, value, fee, timestamp);
	return await from.signMessage(hash);
}

export function GetTransferSigner(transfer: BrokerCAD.CertifiedTransferRequest) {
	const { from, to, value, fee, timestamp, signature } = transfer;
	const hash = GetHash(from, to, value, fee, timestamp);
	return ethers.utils.verifyMessage(hash, signature);
}

/// Build the structure to be passed to the coin servers
/// Build the CertifiedTransferRequest
export async function BuildVerifiedXfer(from: Wallet, to: string, value: number, fee: number, timestamp: number) {
	const signature = await SignVerifiedXfer(from, to, value, fee, timestamp);
	const r: BrokerCAD.CertifiedTransferRequest = {
		from: from.address,
		to: to,
		value: value,
		fee: fee,
		timestamp: timestamp,
		signature: signature
	}
	return r;
}

function GetSaleHash(toEmail: string, transfer: BrokerCAD.CertifiedTransferRequest) {
	return ethers.utils.solidityKeccak256(
		["string", "string"],
		[transfer.signature, toEmail]
	);
}

export async function BuildVerifiedSale(toEmail: string, from: Wallet, to: string, value: number, fee: number, timestamp?: number) {
	const now = Math.floor(Date.now() / 1000)
	// Check that the timestamp being passed not massively invalid
	if (timestamp && Math.abs(timestamp - now) > 86400)
		throw new TypeError("Invalid timestamp - this value should be within one day and marked in seconds")

	const ts = timestamp || now;
	const xfer = await BuildVerifiedXfer(from, to, value, fee, ts);

	const saleHash = GetSaleHash(toEmail, xfer);
	const saleSig = await from.signMessage(saleHash);

	const r: BrokerCAD.CertifiedSale = {
		transfer: xfer,
		clientEmail: toEmail,
		signature: saleSig
	}
	return r;
}

export function GetSaleSigner(sale: BrokerCAD.CertifiedSale) {
	const { transfer, clientEmail, signature } = sale;
	const hash = GetSaleHash(clientEmail, transfer);
	return ethers.utils.verifyMessage(hash, signature);
}

export const InitialCoinBlock = 4456169;
