'use strict';

const { datastore, GetReferrerKey, GetUserKey } = require('./Datastore')
const {IsValidAddress, IsValidReferrerId} = require('@the-coin/utilities');

async function GetReferrerAddress(referrerId) {
	// Get referrers address
	const referrerKey = GetReferrerKey(referrerId);
	const [entity] = await datastore.get(referrerKey);
	if (entity)
		return entity.address
	return null ;
}

async function Create(referral) {
	const { referrerId, newAccount } = referral;

	if (!IsValidReferrerId(referrerId))
		return false;

	if (!IsValidAddress(newAccount))
		return false;

	const referrer = await GetReferrerAddress(referrerId);
	if (!referrer)
		return false;

	// Create new referral link
	const newUserKey = GetUserKey(newAccount);
	const [existing] = await datastore.get(newUserKey);
	if (existing)
		return false;

	const entity = {
		key: newUserKey,
		data: {
			referrer: referrer,
			created: new Date().getTime()
		},
	  };
	  
	  var result = await datastore.insert(entity);
	  console.log(`Create user: ${newAccount} from ${referrer}: ${result}`);
	  return true;
}

module.exports = { GetReferrerAddress, Create }