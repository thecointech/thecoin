'use strict';

const { TapTx } = require('./TapTx');

exports.TapTxBroker = async (request) => {

	const res = await TapTx(request, request, "Supplier");
	return res;
}