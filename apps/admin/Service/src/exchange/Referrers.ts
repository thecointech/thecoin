'use strict';

import { datastore, GetReferrerKey, GetUserKey } from './Datastore'
import {IsValidAddress, IsValidReferrerId} from '@the-coin/utilities'
import { BrokerCAD } from '@the-coin/types';
import { DatastoreKey } from '@google-cloud/datastore/entity';

// Duplicated in Manager-ts
export interface VerifiedReferrer {
	address: string,
	signature: string
}

export interface ReferralData {
	created: Date,
	referrer: string
}

export async function GetReferrerByKey(referrerKey: DatastoreKey)
{
	const [entity] = await datastore.get(referrerKey);
	if (entity)
		return (entity as VerifiedReferrer).address
	return null ;
}
export async function GetReferrerById(referrerId: string) {
	// Get referrers address
	const referrerKey = GetReferrerKey(referrerId);
	return await GetReferrerByKey(referrerKey);
}

export async function Create(referral: BrokerCAD.NewAccountReferal) {
	const { referrerId, newAccount } = referral;

	if (!IsValidReferrerId(referrerId))
		return false;

	if (!IsValidAddress(newAccount))
		return false;

	const referrer = await GetReferrerById(referrerId);
	if (!referrer)
		return false;

	// Create new referral link
	const newUserKey = GetUserKey(newAccount);
	const [existing] = await datastore.get(newUserKey);
	if (existing)
		return false;

	const data: ReferralData = {
		referrer: referrer,
		created: new Date()
	}
	const entity = {
		key: newUserKey,
		data
	};
	  
	var result = await datastore.insert(entity);
	console.log(`Create user: ${newAccount} from ${referrer}: ${result}`);
	return true;
}