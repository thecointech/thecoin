import {
  getReferrerData,
  createReferrer,
  createReferree,
  getUsersReferrer,
} from "./referrals";
import { init } from "@thecointech/firestore";
import { DateTime } from "luxon";

beforeAll(async () => {
  await init();
})

const validAddress = "0xf3B7C73bec2B9A0Af7EEA1fe2f76973D6FBfE658";

test("Can create referrer", async () => {
  // Create a referrer
  const referralId = await createReferrer(validAddress, validAddress);

  // First, do we get valid referrer address for valid referrer ID
  let referrerData = await getReferrerData(referralId);
  expect(referrerData).not.toBeNull();
  referrerData = referrerData!;
  expect(referrerData.address).toMatch(validAddress);
  expect(referrerData.signature).toMatch(validAddress);

  // verify it's case insensitive
  const validIdUC = referralId.toUpperCase();
  const verifyUC = await getReferrerData(validIdUC);
  expect(verifyUC!.address).toEqual(validAddress);
});

// verify a junk key fails.  This is a possibly-valid key that just isn't registered yet
it('Rejects unregistered codes', async () => {
  const junk = "123456";
  const verifyJunk = await getReferrerData(junk);
  expect(verifyJunk).toBeUndefined();
})

test("Can refer new user.", async () => {

  const junk = "123456";

  // Running on emulator
  // Create new account referral
  const newAddress = "2fe3cbf59a777e8f4be4e712945ffefc6612d46f"; //  wallet

  // bad referrer id
  expect(createReferree(junk, newAddress, DateTime.now())).rejects.toThrow("Referrer doesnt exist");
  // Non-throw is success
  const referralId = await createReferrer(validAddress, validAddress);
  await createReferree(referralId, newAddress, DateTime.now());

  // test data store properly
  const referrer = await getUsersReferrer(newAddress);
  expect(referrer).toBeTruthy();
  expect(referrer?.referredBy).toMatch(validAddress);

  // Test re-create fails
  expect(createReferree(referralId, newAddress, DateTime.now())).rejects.toThrow("User already exists");
});
