import {
  GetReferrerData,
  CreateReferrer,
  CreateReferree,
  GetUsersReferrer
} from "./Referrals";
import { GetUserDoc } from "./User";
import { NewAccountReferal } from "@the-coin/types";
import { init, Timestamp } from "./firestore";

async function ClearExistingUser(address: string) {
  // Clear it if it exists already
  try {
    const newUserDoc = await GetUserDoc(address);
    await newUserDoc.delete();
  } catch (e) {
    console.log(e);
  }
}

describe("Connected DB Referral Tests", () => {

  test("Referrals work as expected", async () => {

    jest.setTimeout(30000);
    if (!await init({}))
      return;

    const validAddress = "0xf3B7C73bec2B9A0Af7EEA1fe2f76973D6FBfE658";

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
    const newAddress = "2fe3cbf59a777e8f4be4e712945ffefc6612d46f"; //  wallet
    // Allow any existing to be removed
    await ClearExistingUser(newAddress);

    // Create new referral
    const referral: NewAccountReferal = {
      referrerId: junk,
      newAccount: newAddress
    };
    // bad referrer id
    expect(CreateReferree(referral, Timestamp.now())).rejects.toThrow("Referrer doesnt exist");
    // Non-throw is success
    referral.referrerId = referralId;
    await CreateReferree(referral, Timestamp.now());

    // test data store properly
    const referrer = await GetUsersReferrer(newAddress);
    expect(referrer).toBeTruthy();
    expect(referrer!.referrer).toMatch(validAddress);

    // Test re-create fails
    expect(CreateReferree(referral, Timestamp.now())).rejects.toThrow("User already exists");
  });
});
