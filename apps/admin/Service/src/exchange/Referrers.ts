'use strict';

import {IsValidAddress, IsValidReferrerId} from '@the-coin/utilities'
import { BrokerCAD } from '@the-coin/types';
import { GetReferrerDoc, GetUserDoc } from './Firestore';
import { Timestamp } from '@google-cloud/firestore';



export async function Create(referral: BrokerCAD.NewAccountReferal) {
	const { referrerId, newAccount } = referral;

	if (!IsValidReferrerId(referrerId))
		return false;

	if (!IsValidAddress(newAccount))
		return false;

	const referrerDoc = GetReferrerDoc(referrerId);
	const referrer = await referrerDoc.get()
	if (!referrer.exists)
		return false;

	// Create new referral link
	const newUserKey = GetUserDoc(newAccount);
	const existing = await newUserKey.get();
	if (!existing.exists)
		return false;

	const data: ReferralData = {
		referrer: referrer.get('address'),
		created: Timestamp.now()
	}
	const result = await newUserKey.set(data);
	console.log(`Create user: ${newAccount} from ${referrer} ${result.writeTime}`);
	return true;
}