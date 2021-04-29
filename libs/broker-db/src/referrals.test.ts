import {
  getReferrerData,
  createReferrer,
  createReferree,
  getUsersReferrer
} from "./referrals";
import { getUserDoc } from "./user";
import { NewAccountReferal } from "@thecointech/types";
import { init, Timestamp } from "@thecointech/firestore";

async function ClearExistingUser(address: string) {
  // Clear it if it exists already
  try {
    const newUserDoc = getUserDoc(address);
    await newUserDoc.delete();
  } catch (e) {
    console.log(e);
  }
}

test("Referrals work as expected", async () => {

  jest.setTimeout(30000);
  if (!await init({}))
    return;

  const validAddress = "0xf3B7C73bec2B9A0Af7EEA1fe2f76973D6FBfE658";

  // Create a referrer
  const referralId = await createReferrer(validAddress, validAddress);

  // First, do we get valid referrer address for valid referrer ID
  let referrerData = await getReferrerData(referralId);
  expect(referrerData).not.toBeNull();
  referrerData = referrerData!;
  expect(referrerData.address).toMatch(validAddress);
  expect(referrerData.signature).toMatch(validAddress);

  // verify it's case insensitive
  const validIdUC = ("" + referralId).toUpperCase();
  const verifyUC = await getReferrerData(validIdUC);
  expect(verifyUC!.address).toEqual(validAddress);

  // verify a junk key fails.  This is a possibly-valid key that just isn't registered yet
  const junk = "123456";
  const verifyJunk = await getReferrerData(junk);
  expect(verifyJunk).toBeNull();

  // Running on emulator
  // Create new account referral
  const newAddress = "2fe3cbf59a777e8f4be4e712945ffefc6612d46f"; //  wallet
  // Allow any existing to be removed
  await ClearExistingUser(newAddress);

  // Create new referral
  const referral: NewAccountReferal = {
    referrerId: junk,
    newAccount: newAddress
  };
  // bad referrer id
  expect(createReferree(referral, Timestamp.now())).rejects.toThrow("Referrer doesnt exist");
  // Non-throw is success
  referral.referrerId = referralId;
  await createReferree(referral, Timestamp.now());

  // test data store properly
  const referrer = await getUsersReferrer(newAddress);
  expect(referrer).toBeTruthy();
  expect(referrer!.referrer).toMatch(validAddress);

  // Test re-create fails
  expect(createReferree(referral, Timestamp.now())).rejects.toThrow("User already exists");
});
