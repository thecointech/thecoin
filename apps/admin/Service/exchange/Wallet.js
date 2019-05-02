'use strict';
const ethers = require('ethers');
const encrypted = require('./BrokerTransferAssistantWallet');
let key = require('./secret.json').key;
const utilities = require('@the-coin/utilities');
const TheContract = utilities.TheContract;

let TCWallet = null;
let ConnectedContract = null;

const GetWallet = async () => {
	if (key != null && !TCWallet) {
		TCWallet = await ethers.Wallet.fromEncryptedJson(JSON.stringify(encrypted), key);
		key = undefined;
	}
	return TCWallet;
}

const GetContract = async () => {
	if (!ConnectedContract) {
		let wallet = await GetWallet();
		ConnectedContract = TheContract.GetConnected(wallet);
	}
	return ConnectedContract;
}

exports.GetWallet = GetWallet;
exports.GetContract = GetContract;
