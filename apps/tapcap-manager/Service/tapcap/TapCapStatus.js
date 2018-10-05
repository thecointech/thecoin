'use strict';

const { TheContract, getAccount } = require('./TheContract');
const { datastore, GetLatestKey } = require('./Datastore');

async function GetLatest(address) {
    const key = GetLatestKey(address);
    const results = await ds.get(key);
    const timestamp = Date.now();
    if (results[0])
        return results[0];
    return {
        nonce: 0,
        balance: 0,
        timestamp: timestamp
    };
}

function getAccount(data, signature) {
    return Ethers.Wallet.verifyMessage(data, signature);
}

function signMessage(message, wallet)
exports.TapCapStatus = async (request) => {
	const signature = request.signature;
	const asString = request.message;

	const account = getAccount(asString, signature);
	const tcQueryRequest = JSON.parse(asString);
	const timestamp = tcQueryRequest.timestamp;

	const latest = await GetLatest(address);
	// TODO: Verify timestamp (sensibly)
	if (timestamp > latest.timestamp) {
		const tapCapToken = {
			clientAccount: account,
			availableBalance: latest.balance,
			transactionId: latest.nonce,
			timestamp = Date.now()
		}

	}
}