import { ethers } from 'ethers';
import TheCoinSpec from '@the-coin/contract/build/contracts/TheCoin';

const { abi } = TheCoinSpec;
const { address } = TheCoinSpec.networks[3];
const ropsten = ethers.getDefaultProvider('ropsten');

const TheContract = new ethers.Contract(address, abi, ropsten);

export default TheContract;
export function ParseSignedMessage(signedMessage) {
	return [
		ethers.utils.verifyMessage(signedMessage.message, signedMessage.signature),
		JSON.parse(signedMessage.message)
	];
}
