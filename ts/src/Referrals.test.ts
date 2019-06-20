import {
  GetReferrerData,
  CreateReferrer,
  CreateReferree,
  GetUsersReferrer
} from "./Referrals";
import { GetUserDoc } from "./User";
import { BrokerCAD } from "@the-coin/types";

async function ClearExistingUser(address: string) {
  // Clear it if it exists already
  try {
    const newUserDoc = await GetUserDoc(address);
    await newUserDoc.delete();
  } catch (e) {
    console.log(e);
  }
}

test("Referrals work as expected", async () => {
  jest.setTimeout(30000);
  const validAddress = "0xCA8EEA33826F9ADA044D58CAC4869D0A6B4E90E4";

  // Create a referrer
  const referralId = await CreateReferrer(validAddress, validAddress);

  // First, do we get valid referrer address for valid referrer ID
  let referrerData = await GetReferrerData(referralId);
  expect(referrerData).not.toBeNull();
  referrerData = referrerData!;
  expect(referrerData.address).toMatch(validAddress);
  //expect(referrerData.signature).st.toMatch(validAddress);

  // verify it's case insensitive
  const validIdUC = ("" + referralId).toUpperCase();
  const verifyUC = await GetReferrerData(validIdUC);
  expect(verifyUC!.address).toEqual(validAddress);

  // verify a junk key fails.  This is a possibly-valid key that just isn't registered yet
  const junk = "123456";
  const verifyJunk = await GetReferrerData(junk);
  expect(verifyJunk).toBeNull();

  // Running on emulator
  // Create new account referral
  const newAddress = "2fe3cbf59a777e8f4be4e712945ffefc6612d46f"; // BrokerCAD wallet
  // Allow any existing to be removed
  await ClearExistingUser(newAddress);

  // Create new referral
  const referral: BrokerCAD.NewAccountReferal = {
    referrerId: junk,
    newAccount: newAddress
  };
  // bad referrer id
  expect(CreateReferree(referral)).rejects.toThrow("Referrer doesnt exist");
  // Non-throw is success
  referral.referrerId = referralId;
  await CreateReferree(referral);

  // test data store properly
  const referrer = await GetUsersReferrer(newAddress);
  expect(referrer).toBeTruthy();
  expect(referrer!.referrer).toMatch(validAddress);

  // Test re-create fails
  expect(CreateReferree(referral)).rejects.toThrow("User already exists");
});
