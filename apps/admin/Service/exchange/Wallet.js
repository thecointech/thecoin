'use strict';
const ethers = require('ethers');
const encrypted = require('./BrokerTransferAssistantWallet');
let key = require('./secret.json').key;

let TCWallet = null;

async function DecryptWallet(key) {
	TCWallet = await ethers.Wallet.fromEncryptedJson(JSON.stringify(encrypted), key);
	return TCWallet;
}

exports.DecryptWallet = async () => {
	if (key != null) {
		await DecryptWallet(key);
		key = undefined;
	}
	return TCWallet;
}
exports.GetWallet = () => TCWallet;
