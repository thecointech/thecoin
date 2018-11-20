import { ethers } from 'ethers';
import TheCoinSpec from '@the-coin/contract/build/contracts/TheCoin';

const { abi } = TheCoinSpec;
const { address } = TheCoinSpec.networks[3];
const ropsten = ethers.getDefaultProvider('ropsten');

let theContract = new ethers.Contract(address, abi, ropsten);

export function GetContract() { return theContract; };
export function ConnectWallet(wallet) {
	const provider = theContract.provider;
	const connectedWallet = wallet.connect(provider);
	theContract = theContract.connect(connectedWallet);
	return connectedWallet;
}
export function ParseSignedMessage(signedMessage) {
	return [
		ethers.utils.verifyMessage(signedMessage.message, signedMessage.signature),
		JSON.parse(signedMessage.message)
	];
}
