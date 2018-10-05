'use strict';

const ethers = require('ethers');
const encrypted = require('./TapCapManagerWallet');

let TCWallet = null;

async function DecryptWallet(key) {
	TCWallet = await ethers.Wallet.fromEncryptedJson(JSON.stringify(encrypted), key);
	return TCWallet;
}

if (process.env.TC_WALLET_KEY) {
	DecryptWallet(process.env.TC_WALLET_KEY);
}

exports.TCWallet = TCWallet;
exports.DecryptWallet = DecryptWallet;