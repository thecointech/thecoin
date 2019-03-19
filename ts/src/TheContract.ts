import { ethers, Wallet } from 'ethers';
import TheCoinSpec from '@the-coin/contract/build/contracts/TheCoin.json';

const { abi } = TheCoinSpec;
// NOTE: When changing from Ropsten to Mainnet, update
// address, provider, and InitialCoinBlock below.
const { address } = TheCoinSpec.networks[3];
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

export function ParseSignedMessage(signedMessage) {
	return [
		ethers.utils.verifyMessage(signedMessage.message, signedMessage.signature),
		JSON.parse(signedMessage.message)
	];
}

function GetHash(from: string, to: string, value: number, fee: number, timestamp: number)
{
	const ethersHash = ethers.utils.solidityKeccak256(
        ["address", "address", "uint256", "uint256", "uint256"],
        [from, to, value, fee, timestamp]
      );
	return ethers.utils.arrayify(ethersHash)
}
export async function SignVerifiedXfer(from: Wallet, to: string, value: number, fee: number, timestamp: number)
{
	const hash = GetHash(from.address, to, value, fee, timestamp);
	return await from.signMessage(hash);
}

export function VerifySignedXfer(from: string, to: string, value: number, fee: number, timestamp: number, signature: string)
{
	const hash = GetHash(from, to, value, fee, timestamp);
	return ethers.utils.verifyMessage(hash, signature);
}

export const InitialCoinBlock = 4456169;
