'use strict';

const ethers = require('ethers')

const { ParseSignedMessage } = require('@the-coin/utilities/TheContract');
const { datastore, GetLatestKey } = require('./Datastore');
const { GetWallet } = require('./Wallet');

//
// Build no-change latest: 
function BuildBlankTx(txKey, toAddress, latest, nonce, timestamp) {
	return [
		{
			key: latest[datastore.KEY],
			data: {
				balance: latest.balance,
				nonce: nonce,
				timestamp: timestamp
			}
		},
		{
			key: txKey,
			data: {
				balance: latest.balance,
				change: 0,
				timestamp: timestamp,
				toAddress: toAddress
			}
		}
	];
}

//
// build list of items to update
function BuildUpdates(allTxs, latest)
{
	// If we have at least 1 transaction, then we revert everything currently registered
	const revertChange = allTxs[0].change;
	// it's possible this was already reverted by the counter-party
	if (revertChange == 0)
		return;
	// Mark the reverted tx as 0 change
	allTxs[0].change = 0;

	// Create new list with updated balance for each tx
	return allTxs.map(tx => {
		// Ensure we strip any extra attributes added by js from obj
		return {
			key: tx[datastore.KEY],
			data: {
				balance: tx.balance + revertChange,
				change: tx.change,
				timestamp: tx.timestamp,
				toAddress: tx.toAddress
			}
		};
	}).concat([
		{
			key: latest[datastore.KEY],
			data: {
				balance: latest.balance + revertChange,
				nonce: latest.nonce,
				timestamp: latest.timestamp
			}
		}
	]);
}

// Delete a tx.  This function is open to all
// TODO - security
// Potential Targets:
//		Supplier, Client, Me
// Motivations:
// 		malicious client may try to spoof this to prevent supplier from getting paid
//		malicious 3rd party may try to spoof this to cause difficulties for supplier/client
//		malicious supplier may try to change payment amount via this fn
//		malicious actor may try to DDOS me by overloading servers with this running
//
//	Accidental:
//		Is it possible for the nonce-chain to be broken - contesting future nonce?
exports.DeleteTx = async function(uncompleted, storeName) {
	const [clientAddress, clientRequest] = ParseSignedMessage(uncompleted.signedRequest);
	const supplierAddress = ethers.utils.verifyMessage(uncompleted.signedRequest.message, uncompleted.supplierSignature);
	const [myAddress, token] = ParseSignedMessage(clientRequest.token);

	// Verify the token is legitimate
	if (myAddress != GetWallet().address)
		throw("Invalid token signature.  Please contact support");

	// First, verify that this message is from the actual supplier in question.
	if (supplierAddress.toLowerCase() != clientRequest.supplierAddress.toLowerCase())
	{
		console.warn(`Supplier did not sign DeleteTx: ${supplierAddress} != ${clientRequest.supplierAddress}, sent by ${clientAddress}`);
		return;
	}

	// Find all tx's larger than nonce (inclusive)
	const latestKey = GetLatestKey(clientAddress);
	const userKey = datastore.key(["User", clientAddress]);
	const txKey = datastore.key(["User", clientAddress, "tx", token.nonce]);
	const txStoreKey = datastore.key(["User", clientAddress, "tx", token.nonce, "as", storeName]);
	const transaction = datastore.transaction();

	await transaction
		.run()
		.then((err) => {

			const query = transaction
				.createQuery('tx')
				.hasAncestor(userKey)
				.filter('__key__', '>=', txKey);

			return Promise.all([query.run(), transaction.get(txStoreKey), transaction.get(latestKey)])
		})
		.then((results) => {
			let [allTxs, txStore, latest] = results.map(result => result[0]);
			if (txStore != undefined) {
				// It's possible this is a duplicate, if so: just bail
				// TODO: Verify supplier signatures
				// TODO: Verify everything else!
				if (txStore.message == request.message)
					return;
				// This tx has been confirmed already: we continue, but log error to deal with
				console.error("Resetting tx that was previously confirmed: ", txKey)
			}
			
			let firstId = (allTxs.length > 1 && parseInt(allTxs[0][datastore.KEY].id)) || -1;
			// check if the first tx logged is actually the tx being referenced here
			let updates = [];
			if (firstId == token.nonce) {
				updates = BuildUpdates(allTxs, latest)
			}
			else {
				// This tx has not been registered yet.  In this case, just store the cancel struct 
				// in case someone tries to register this tx later.
				updates = BuildBlankTx(txKey, supplierAddress, latest, token.nonce, clientRequest.timestamp);
			}
			// Save all to disk, along with the delete cmd.
			transaction.save(updates.concat([
				{
					key: txStoreKey,
					data: uncompleted
				}
			]));
			return transaction.commit();
		})
		.catch((err) => {
			// TODO: Add retry logic
			transaction.rollback()
			console.error("Oh No!: " + err);
			throw err;
		});

}