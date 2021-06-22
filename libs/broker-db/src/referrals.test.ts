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
const junk = "123456";

it("Can create referrer", async () => {
  // Create a referrer
  const referralCode = await createReferrer(validAddress, validAddress);

  // First, do we get valid referrer address for valid referrer ID
  let referrerData = await getReferrerData(referralCode);
  expect(referrerData).not.toBeNull();
  referrerData = referrerData!;
  expect(referrerData.address).toMatch(validAddress);
  expect(referrerData.signature).toMatch(validAddress);
});

it('is referrer code is case insensitive', async () => {
  const referralCode = await createReferrer(validAddress, validAddress);
  const validIdUC = referralCode.toUpperCase();
  const verifyUC = await getReferrerData(validIdUC);
  expect(verifyUC!.address).toEqual(validAddress);
})

it('returns undefined for non-existent referrer', async () => {
  const verifyJunk = await getReferrerData(junk);
  expect(verifyJunk).toBeUndefined();
})

it('throws with invalid referral code', async () => {
  expect(createReferree("345679", validAddress, DateTime.now())).rejects.toThrow("Referral code doesnt exist");
})

it("Can refer new user.", async () => {
  const newAddress = `0x123456789012345678901234567${Date.now()}`;
  const referralCode = await createReferrer(validAddress, validAddress);
  await createReferree(referralCode, newAddress, DateTime.now());

  // test data store properly
  const referrer = await getUsersReferrer(newAddress);
  expect(referrer).toBeTruthy();
  expect(referrer?.referredBy).toMatch(validAddress);

  // Test re-create fails
  expect(createReferree(referralCode, newAddress, DateTime.now())).rejects.toThrow("User already exists");
});
