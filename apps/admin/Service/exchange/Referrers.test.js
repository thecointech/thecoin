const { GetReferrerAddress } = require('./Referrers')
const { datastore, GetReferrerKey } = require('./Datastore')

test("Status is valid", async () => {

	const validId = '7k5y8w';
	const validAddress = '0xCA8EEA33826F9ADA044D58CAC4869D0A6B4E90E4';

	const host = process.env.DATASTORE_EMULATOR_HOST;
	if (host) // Running on emulator
	{
		// Setup dummy key
		const referrerKey = GetReferrerKey(validId)
		await datastore.upsert({
			key: referrerKey,
			data: {
				address: validAddress,
				signature: "dummytest"
			}
		})
	}

	const validIdUC = '7k5y8w'.toUpperCase();


	// First, do we get valid referrer address for valid referrer ID
	const verifyValid = await GetReferrerAddress(validId);
	expect(verifyValid).toEqual(validAddress);

	// verify it's case insensitive
	const verifyUC = await GetReferrerAddress(validIdUC);
	expect(verifyUC).toEqual(validAddress);

	// verify a junk key fails.  This is a possibly-valid key that just isn't registered yet
	const junk = '123456';
	const verifyJunk = await GetReferrerAddress(junk);
	expect(verifyJunk).toBeNull();
})