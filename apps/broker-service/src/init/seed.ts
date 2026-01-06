//
// In dev:live, we need basic setup for our
//
import { getAddressShortCodeSig, NormalizeAddress } from "@thecointech/utilities";
import { createReferree, createReferrer } from "@thecointech/broker-db/referrals";
import { getUserVerified } from "@thecointech/broker-db/user";
import { getSigner } from "@thecointech/signers";
import { DateTime } from "luxon";
import { uploadUserData } from '../verify'
//
// When we seed the DB, we initialize the DB with 1 verified client, and 1 referred
export async function seed() {
  const Client1 = await getSigner("Client1");
  const clientAddress = await Client1.getAddress();

  // test if seed hasn't happened yet
  if (!await getUserVerified(clientAddress)) {
    const code = await setVerified(clientAddress);
    await referClient2(code);
  }
}

//
// Set the first account as verified, this allows it to refer other accounts
async function setVerified(clientAddress: string) {
  const address = NormalizeAddress(clientAddress);
  // First, supply verified details
  await uploadUserData(clientAddress, {
    status:  "approved",
    blockPassID: "12345",
    identities: {
      given_name: { value: "Test" },
      family_name: { value: "Account" },
      dob: { value: "12/31/2016" },
    }
  } as any)
  // Next, create referral code
  const signer = await getSigner("BrokerCAD");
  const sig = await getAddressShortCodeSig(address, signer);
  const code = await createReferrer(sig, address);
  console.log(`Seeded valid: ${code} from ${address}`);
  return code!;
}

//
// Automatically make #acc1 refer #acc2
async function referClient2(code: string) {
  const Client2 = await getSigner("Client2");
  const clientAddress = await Client2.getAddress();
  // Client2 created 1 year ago
  const ts = DateTime.now().minus({years: 1});
  await createReferree(code, clientAddress, ts)
  console.log(`Referred with: ${code} acc ${clientAddress}`);
}

