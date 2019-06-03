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
// Get/Restore bill payment info.



export const InitialCoinBlock = 4456169;
