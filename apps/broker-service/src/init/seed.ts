//
// In dev:live, we need basic setup for our
//
import { NormalizeAddress } from "@the-coin/utilities";
import { Timestamp } from "@the-coin/utilities/firestore/timestamp";
import { CreateReferree, CreateReferrer } from "@the-coin/utilities/Referrals";
import { GetUserVerified, SetUserVerified } from "@the-coin/utilities/User";
import { getWallet } from "@the-coin/utilities/Wallets";

//
// When we seed the DB, we initialize the DB with 1 verified client, and 1 referred
export async function seed() {
  const client1 = await getWallet("client1");
  const clientAddress = await client1.getAddress();

  // test if seed hasn't happened yet
  if (!await GetUserVerified(clientAddress)) {
    const code = await setVerified(clientAddress);
    await referClient2(code);
  }
}

//
// Set the first account as verified, this allows it to refer other accounts
async function setVerified(clientAddress: string) {
  const brokerCad = await getWallet("BrokerCAD");
  const address = NormalizeAddress(clientAddress);
  const signature = await brokerCad.signMessage(address)

  await SetUserVerified(signature, address, Timestamp.now());
  const code = await CreateReferrer(signature, address);
  console.log(`Seeded valid: ${code} from ${address}`);
  return code;
}

//
// Automatically make #acc1 refer #acc2
async function referClient2(code: string) {
  const client2 = await getWallet("client2");
  const clientAddress = await client2.getAddress();
  const ts = Timestamp.fromMillis(Date.now() - (365 * 24 * 60 * 60 * 1000));
  await CreateReferree({
    newAccount: clientAddress,
    referrerId: code,
  }, ts)
  console.log(`Referred with: ${code} acc ${clientAddress}`);
}

