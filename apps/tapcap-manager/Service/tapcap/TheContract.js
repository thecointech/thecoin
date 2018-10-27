'use strict';

const Ethers = require('ethers');
const TheCoinSpec = require('@the-coin/contract/build/contracts/TheCoin');

const { abi } = TheCoinSpec;
const { address } = TheCoinSpec.networks[3];
const ropsten = Ethers.getDefaultProvider('ropsten');

const theContract = new Ethers.Contract(address, abi, ropsten);

exports.TheContract = theContract;
exports.ParseSignedMessage = function (signedMessage) {
	return [
		Ethers.utils.verifyMessage(signedMessage.message, signedMessage.signature),
		JSON.parse(signedMessage.message)
	];
}

