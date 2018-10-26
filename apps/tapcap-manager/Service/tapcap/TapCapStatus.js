'use strict';

const { ParseSignedMessage } = require('./TheContract');
const { datastore, GetLatestKey } = require('./Datastore');
const { GetWallet } = require('./Wallet');

async function GetLatest(address) {
    const key = GetLatestKey(address);
    const results = await datastore.get(key);
    const timestamp = Date.now();
    if (results[0])
        return results[0];
    return {
        nonce: 0,
        balance: 0,
        timestamp: timestamp
    };
}

exports.GetStatus = async (address, timestamp) => {
	const latest = await GetLatest(address);
	// TODO: Verify timestamp (sensibly)
	if (timestamp <= latest.timestamp)
		throw("Invalid Request");

	// TODO: Only build the token if identity is verified
	const tapCapTokenData = {
		clientAccount: address,
		availableBalance: Math.floor(latest.balance / 2),
		nonce: latest.nonce + 1,
		timestamp: Date.now()
	}
	const dataStr = JSON.stringify(tapCapTokenData);
	const tokenSig = await GetWallet().signMessage(dataStr);
	const TapCapToken = {
		message: dataStr,
		signature: tokenSig
	};

	const response = {
		balance: latest.balance,
		token: TapCapToken
	}
	return response;
};

exports.TapCapStatus = async (request) => {
	const signature = request.signature;
	const asString = request.message;

	const [address, tcQueryRequest] = ParseSignedMessage(request);
	const timestamp = tcQueryRequest.timestamp;

	return exports.GetStatus(address, timestamp);
}