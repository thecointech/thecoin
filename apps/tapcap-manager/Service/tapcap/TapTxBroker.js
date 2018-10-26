'use strict';

const { TapTx } = require('./TapTx');

exports.TapTxBroker = async (request) => {

	const res = await TapTx(request, request, "Supplier");
	return res;
	
	// const [brokerAddress, tcBrokerComplete] = ParseSignedMessage(request);
	// const [clientAddress, tcClientRequest] = ParseSignedMessage(tcBrokerComplete.signedRequest);
	// const [myAddress, token] = ParseSignedMessage(tcClientRequest.token);

	// if (myAddress != GetWallet().address)
	// 	throw("Invalid token signature.  Please contact support");

	// const txKey = datastore.key(["User", clientAddress, "tx", token.nonce]);
	// const txBrokerKey = datastore.key(["User", clientAddress, "tx", token.nonce, "as", "broker"]);
    // const latestKey = GetLatestKey(clientAddress);

	// const txtimestamp = tcClientRequest.timestamp;
	// const transaction = datastore.transaction();
    // transaction
    //     .run()
    //     .then(() => Promise.all([transaction.get(txKey), transaction.get(txBrokerKey), transaction.get(latestKey)]))
    //     .then((results) => {
	// 		let [tx, txBroker, latest] = results.map(result => result[0]);
	// 		if (!latest) {
	// 			throw("No user records found - please verify -everything-");
	// 		}
	// 		if (txBroker) {
	// 			// It's possible this is a duplicate, if so: just bail
	// 			if (txBroker.message == request.message)
	// 				return;
	// 			// TODO: Graceful handling of duplicated nonce
	// 			throw("Tx nonce duplicate")
	// 		}

    //         let {timestamp, balance, nonce} = latest;
	// 		const change = tcBrokerComplete.coinCharge;

	// 		// The balance may be updated by the client, possibly
	// 		// even before this fn is called.  If so, we do not want
	// 		// to re-apply it.  Only modify balance if it has not been
	// 		// done so already
	// 		let txbalance = tx && tx.balance;
	// 		if (txbalance == undefined) {
	// 			balance = balance - change;
	// 			txbalance = balance;
	// 		}
	// 		else {
	// 			// Verify basic info is identical
	// 			if (tx.change != change)
	// 				throw("Tx change non-similar to existing record");
	// 			if (tx.timestamp != txtimestamp)
	// 				throw("Tx timestamp non-similar to existing record");
	// 		}

	// 		// TODO: AvailExceeded handling
	// 		if (balance < 0)
	// 			throw("Tap capacity exceeded!");

    //         transaction.save([
    //             {
    //                 key: txKey,
    //                 data: {
	// 					change: change,
    //                     timestamp: txtimestamp,
    //                     balance: txbalance
    //                 },
	// 			},
	// 			{
	// 				key: txBrokerKey,
	// 				data: request
	// 			},
    //             {
    //                 key: latestKey,
    //                 data: {
    //                     nonce: Math.max(nonce, token.nonce),
    //                     timestamp: txtimestamp,
    //                     balance: balance
    //                 },
    //             }
    //         ]);
    //         return transaction.commit();
    //     })
    //     .catch((err) => {
    //         // TODO: Add retry logic
    //         transaction.rollback()
    //         console.error("Oh No!: " + err);
    //     });
}