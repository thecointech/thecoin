'use strict';
const ConnectWallet = require('@the-coin/utilities/TheContract').ConnectWallet;
const ethers = require('ethers');
const encrypted = require('./TapCapManagerWallet');
let key = require('./secret.json').key;

let TCWallet = null;

async function DecryptWallet(key) {
	TCWallet = await ethers.Wallet.fromEncryptedJson(JSON.stringify(encrypted), key);
	ConnectWallet(TCWallet);
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
