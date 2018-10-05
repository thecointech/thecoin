'use strict';

const Ethers = require('ethers')

const { TheContract } = require('./TheContract');
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

function getAccount(data, signature) {
    return Ethers.utils.verifyMessage(data, signature);
}

exports.TapCapStatus = async (request) => {
	const signature = request.signature;
	const asString = request.message;

	const address = getAccount(asString, signature);
	const tcQueryRequest = JSON.parse(asString);
	const timestamp = tcQueryRequest.timestamp;

	const latest = await GetLatest(address);
	// TODO: Verify timestamp (sensibly)
	if (timestamp <= latest.timestamp)
		throw("Invalid Request");

	
	// TODO: Only build the token if identity is verified
	const tapCapTokenData = {
		clientAccount: address,
		availableBalance: Math.floor(latest.balance / 2),
		transactionId: latest.nonce,
		timestamp: Date.now()
	}
	const dataStr = JSON.stringify(tapCapTokenData);
	const TapCapToken = {
		message: dataStr,
		signature: GetWallet().signMessage(dataStr)
	};

	const response = {
		balance: latest.balance,
		token: TapCapToken
	}
	return response;

	// return new Promise(function(resolve, reject) {
	// 	var examples = {};
	// 	examples['application/json'] = {
	//   "balance" : 0.80082819046101150206595775671303272247314453125,
	//   "weeklyTopup" : 6.02745618307040320615897144307382404804229736328125,
	//   "token" : {
	// 	"signature" : "signature"
	//   }
	// };
	// 	if (Object.keys(examples).length > 0) {
	// 	  resolve(examples[Object.keys(examples)[0]]);
	// 	} else {
	// 	  resolve();
	// 	}
	//   });
}