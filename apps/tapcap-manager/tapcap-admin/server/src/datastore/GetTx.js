const { GetLatestKey, datastore } = require('./Datastore')

async function FetchCheckpointsSince(timestamp) {
	try {
		const query = datastore
			.createQuery('checkpoint')
			.filter('timestamp', '>=', timestamp);

		const results = await datastore.runQuery(query);
		const checkpoints = results[0]
		if (results[1].moreResults != "NO_MORE_RESULTS")
			throw("ERROR: Num Results maxed out at: " + checkpoints.length);
		return checkpoints;
	}
	catch (e) {
		console.error(e, "Error when fetching checkoints");
	}
	return [];
}

async function FetchUserTransactions(user, last, latest) {
	try {
		console.info('')
		const query = datastore
			.createQuery('tx')
			.filter('__key__', '>', datastore.key(['User', user, 'tx', last]))
			.filter('__key__', '<=', datastore.key(['User', user, 'tx', latest]));

		const results = await datastore.runQuery(query);
		const txs = results[0]
		return txs;
	}
	catch (e) {
		console.error(e, "Error when fetching transactions");
	}
	return [];
}

async function FillTransactionsForUsers(allUsers)
{
	for (var user in allUsers) {
		let lastNonce = 1;
		let latestNonce = 0;
		let userData = allUsers[user]
		for (var cpid in userData)
		{
			const thisNonce = userData[cpid].nonce
			if (cpid == 'latest')
				latestNonce = thisNonce
			else
				lastNonce = Math.max(lastNonce, thisNonce);
		}

		if (latestNonce == 0)
			throw("Invalic noncing for user: " + user)

		// early exit - we don't need to process anything if no tx's happened
		if (latestNonce == lastNonce)
			continue;

		userData['txs'] = await FetchUserTransactions(user, lastNonce, latestNonce);
	}
}
function OrganizeCheckpointsByUser(allCheckpoints)
{
	// Gather checkpoints by User
	let cpByUser = {};
	allCheckpoints.forEach(checkpoint => {
		const key = checkpoint[datastore.KEY]
		const user = key.parent.name;
		
		let userCps = cpByUser[user]
		if (!userCps)
		{
			userCps = cpByUser[user] = {}
		}
		userCps[key.name] = checkpoint		
	});
	return cpByUser;
}

exports.GetTransactions = async (lastCheckpoint) => {
	const allCheckpoints = await FetchCheckpointsSince(0);
	let userData = OrganizeCheckpointsByUser(allCheckpoints);
	FillTransactionsForUsers(userData)
	return userData;
}