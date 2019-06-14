import { GetReferrerById, GetReferrerByKey, Create, ReferralData, VerifiedReferrer } from './Referrers';
import { datastore, GetReferrerKey, GetUserKey } from './Datastore';


test("Referrals work as expected", async () => {

	const validId = '7k5y8w';
	const validAddress = '0xCA8EEA33826F9ADA044D58CAC4869D0A6B4E90E4';

	const host = process.env.DATASTORE_EMULATOR_HOST;
	if (host) // Running on emulator
	{
		// Setup dummy key
		const referrerKey = GetReferrerKey(validId)
		const data: VerifiedReferrer = {
			address: validAddress,
			signature: "dummytest"			
		}
		await datastore.upsert({
			key: referrerKey,
			data
		})
	}
	const validIdUC = '7k5y8w'.toUpperCase();

	// First, do we get valid referrer address for valid referrer ID
	const verifyValid = await GetReferrerById(validId);
	expect(verifyValid).toEqual(validAddress);

	// verify it's case insensitive
	const verifyUC = await GetReferrerById(validIdUC);
	expect(verifyUC).toEqual(validAddress);

	// verify a junk key fails.  This is a possibly-valid key that just isn't registered yet
	const junk = '123456';
	const verifyJunk = await GetReferrerById(junk);
	expect(verifyJunk).toBeNull();

	if (host) // Running on emulator
	{
		// Create new account referral
		const newAccount = '2fe3cbf59a777e8f4be4e712945ffefc6612d46f' // BrokerCAD wallet
		const newUserKey = GetUserKey(newAccount);

		const referral = { 
			referrerId: validId,
			newAccount: newAccount
		}
		try {
			// If this already exists, delete it
			await datastore.delete(newUserKey);
		}
		catch(err) {/* eat errors */}

		// Test can create
		const success = await Create(referral);
		expect(success).toBe(true);

		// test data store properly
		const referrer = await GetReferrerByKey(newUserKey);
		expect(referrer).toBe(validAddress);

		// Test re-create fails
		const dup = await Create(referral);
		expect(dup).toBe(false);
	}
})