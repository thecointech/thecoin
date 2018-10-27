'use strict';

const Ethers = require('ethers');
const encrypted = require('./TapCapManagerWallet');
let key = require('./secret.json').key;

let TCWallet = null;

async function DecryptWallet(key) {
	TCWallet = await Ethers.Wallet.fromEncryptedJson(JSON.stringify(encrypted), key);
	return TCWallet;
}

if (key != null) {
	DecryptWallet(key);
	key = undefined;
}

exports.GetWallet = () => TCWallet;
exports.DecryptWallet = DecryptWallet;