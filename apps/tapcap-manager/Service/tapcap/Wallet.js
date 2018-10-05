'use strict';

const ethers = require('ethers');
const encrypted = require('./TapCapManagerWallet');

let TCWallet = null;

exports.TCWallet = TCWallet;
exports.DecryptWallet = async (password) => {
	TCWallet = await ethers.Wallet.fromEncryptedJson(encrypted, password);
	return true;
}


