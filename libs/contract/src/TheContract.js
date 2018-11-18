import Ethers frmo 'ethers';
import TheCoinSpec from ('../build/contracts/TheCoin');

const { abi } = TheCoinSpec;
const { address } = TheCoinSpec.networks[3];
const ropsten = Ethers.getDefaultProvider('ropsten');

export default const TheContract = new Ethers.Contract(address, abi, ropsten);
export function ParseSignedMessage(signedMessage) {
	return [
		Ethers.utils.verifyMessage(signedMessage.message, signedMessage.signature),
		JSON.parse(signedMessage.message)
	];
}

