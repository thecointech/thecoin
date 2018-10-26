'use strict';

const Ethers = require('ethers')

const { ParseSignedMessage } = require('./TheContract');
const { datastore, GetLatestKey } = require('./Datastore');
const { GetWallet } = require('./Wallet');


exports.TapTx = function(request, signedRecord, storeName) {
	
	return new Promise((resolve, reject) => {
		const [supplierAddress, supplierRecord] = ParseSignedMessage(signedRecord);
		const signedTCRequest = supplierRecord.signedRequest;
		const coinCharge = supplierRecord.coinCharge;
		const [clientAddress, tcClientRequest] = ParseSignedMessage(signedTCRequest);
		const [myAddress, token] = ParseSignedMessage(tcClientRequest.token);

		// Verify the token is legitimate
		if (myAddress != GetWallet().address)
			throw("Invalid token signature.  Please contact support");
	
		const txKey = datastore.key(["User", clientAddress, "tx", token.nonce]);
		const txStoreKey = datastore.key(["User", clientAddress, "tx", token.nonce, "as", storeName]);
		const latestKey = GetLatestKey(clientAddress);
	
		const txtimestamp = tcClientRequest.timestamp;
		const transaction = datastore.transaction();
		transaction
			.run()
			.then(() => Promise.all([transaction.get(txKey), transaction.get(txStoreKey), transaction.get(latestKey)]))
			.then((results) => {
				let [tx, txStore, latest] = results.map(result => result[0]);
				if (!latest) {
					reject("No user records found - please verify -everything-");
				}
				if (txStore) {
					// It's possible this is a duplicate, if so: just bail
					if (txStore.message == request.message)
						return;
					// TODO: Graceful handling of duplicated nonce
					throw("Tx nonce duplicate")
				}
	
				let {timestamp, balance, nonce} = latest;
				const change = coinCharge;
	
				// The balance may be updated by the client, possibly
				// even before this fn is called.  If so, we do not want
				// to re-apply it.  Only modify balance if it has not been
				// done so already
				let txbalance = tx && tx.balance;
				if (txbalance == undefined) {
					balance = balance - change;
					txbalance = balance;

					// TODO: AvailExceeded handling
					if (balance < 0)
						throw("Tap capacity exceeded!");
					
					transaction.save([
						{
							key: txKey,
							data: {
								change: change,
								toAddress: supplierAddress,
								timestamp: txtimestamp,
								balance: txbalance
							},
						},
						{
							key: latestKey,
							data: {
								nonce: Math.max(nonce, token.nonce),
								timestamp: txtimestamp,
								balance: balance
							},
						}
					]);
				}
				else {
					// Verify basic info is identical
					if (tx.change != change)
						throw(`${storeName} Tx change different to existing record`);
					if (tx.timestamp != txtimestamp)
						throw(`${storeName} Tx timestamp different to existing record`);
					if (tx.toAddress != supplierAddress)
						throw(`${storeName} Tx toAddress different to existing record`);
				}
	
				// Store the tx data
				transaction.save([
					{
						key: txStoreKey,
						data: request
					}
				]);
				return transaction.commit();
			})
			.then((res) => resolve(res))
			.catch((err) => {
				// TODO: Add retry logic
				transaction.rollback()
				console.error("Oh No!: " + err);
				reject();
			});
	});
}