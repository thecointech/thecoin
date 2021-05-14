//
// In dev:live, we need basic setup for our
//
import { NormalizeAddress } from "@thecointech/utilities";
import { createReferree, createReferrer } from "@thecointech/broker-db/referrals";
import { setUserVerified, getUserVerified } from "@thecointech/broker-db/user";
import { getSigner } from "@thecointech/accounts";
import { DateTime } from "luxon";
//
// When we seed the DB, we initialize the DB with 1 verified client, and 1 referred
export async function seed() {
  const client1 = await getSigner("client1");
  const clientAddress = await client1.getAddress();

  // test if seed hasn't happened yet
  if (!await getUserVerified(clientAddress)) {
    const code = await setVerified(clientAddress);
    await referClient2(code);
  }
}

//
// Set the first account as verified, this allows it to refer other accounts
async function setVerified(clientAddress: string) {
  const brokerCad = await getSigner("BrokerCAD");
  const address = NormalizeAddress(clientAddress);
  const signature = await brokerCad.signMessage(address);
  // Account created 1 year, 1 day ago.
  const ts = DateTime.now().minus({years: 1, days: 1});
  await setUserVerified(signature, address, ts);
  const code = await createReferrer(signature, address);
  console.log(`Seeded valid: ${code} from ${address}`);
  return code;
}

//
// Automatically make #acc1 refer #acc2
async function referClient2(code: string) {
  const client2 = await getSigner("client2");
  const clientAddress = await client2.getAddress();
  // Client2 created 1 year ago
  const ts = DateTime.now().minus({years: 1});
  await createReferree(clientAddress, code, ts)
  console.log(`Referred with: ${code} acc ${clientAddress}`);
}

