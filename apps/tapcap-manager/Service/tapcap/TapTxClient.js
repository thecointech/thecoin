'use strict';

const Ethers = require('ethers')

const { ParseSignedMessage } = require('@the-coin/utilities/TheContract');
const { TapTx } = require('./TapTx');
const { GetStatus } = require('./TapCapStatus');


exports.TapTxClient = async (request) => {
	const [clientAddress, signedSupplierPurchase] = ParseSignedMessage(request);

	const res = await TapTx(request, signedSupplierPurchase, "Client");
	const status = await GetStatus(clientAddress, new Date().getTime());
	return status;
}