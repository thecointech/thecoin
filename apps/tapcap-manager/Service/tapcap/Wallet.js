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

if (key != null) {
	DecryptWallet(key);
	key = undefined;
}

exports.GetWallet = () => TCWallet;
exports.DecryptWallet = DecryptWallet;