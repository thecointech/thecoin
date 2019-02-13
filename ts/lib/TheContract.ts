import { ethers, Wallet } from 'ethers';
import TheCoinSpec from '@the-coin/contract/build/contracts/TheCoin.json';

const { abi } = TheCoinSpec;
const { address } = TheCoinSpec.networks[3];
const ropsten = ethers.getDefaultProvider('ropsten');

const theContract = new ethers.Contract(address, abi, ropsten);

export default function GetContract() { return theContract; };

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
