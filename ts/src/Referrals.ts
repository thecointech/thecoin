import { Timestamp } from "@google-cloud/firestore";
import { firestore, GetUserDoc } from "./Firestore";
import { IsValidAddress } from "./Address";
import { BrokerCAD } from "@the-coin/types";


function GetReferrersCollection()
{
	return firestore.collection("Referrers")
}
// Document stored as /Referrer/{id}/
// Contains the address of the referrer, and is
// signed by TheCoin
export interface VerifiedReferrer {
	address: string,
	signature: string
}

// Subsection of user-data associated with referrals
export interface ReferralData {
	created: Timestamp,
	referrer: string
}

// Valid ID's exclude IOUL
export function IsValidReferrerId(id) {
	return /^[a-hj-km-np-tv-z0-9]{6}$/i.test(id)
}

// GetReferrer
export function GetReferrerDoc(referrerId: string) {
	if (!IsValidReferrerId(referrerId)) {
			console.error(`${referrerId} is not a valid address`);
			throw new Error("Invalid Referrer");
	}
	return GetReferrersCollection().doc(referrerId.toLowerCase());
}

export async function GetReferrerData(referrerId: string) : Promise<VerifiedReferrer|null> {
	const referrer = await GetReferrerDoc(referrerId).get();
	return referrer.exists ? referrer.data() as VerifiedReferrer : null;
}

export async function GetUsersReferrer(address: string) : Promise<ReferralData|null> {
	const user = await GetUserDoc(address).get();
	if (user.exists && user.get('referrer'))
	{
		return user.data() as ReferralData;
	}
	return null;
}

function GetReferrerCode(signature: string) {
	const normSig = signature[1] == 'x' ? signature.slice(2) : signature;
	const buffer = Buffer.from(normSig, 'hex');
	const s2: string = base32.encode(buffer);
	return s2.slice(-6).toLowerCase();
}

export async function CreateReferrer(signature: string, address: string)
{
	const code = GetReferrerCode(signature);
	const referrerDoc = GetReferrersCollection().doc(code);
	const data: VerifiedReferrer = {
		address,
		signature
	};
	await referrerDoc.set(data);
}

export async function CreateReferree(referral: BrokerCAD.NewAccountReferal) {
	const { referrerId, newAccount } = referral;

	if (!IsValidReferrerId(referrerId))
		throw new Error("Invalid ") false;

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