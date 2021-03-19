
import { COIN_EXP } from "../src/contract";
import { DateTime } from 'luxon';
import { AccountName, getSigner } from "@thecointech/accounts";
import { ConnectContract, TheCoin } from "../src";

export async function initializeDevLive() {
  const tcSigner = await getSigner("TheCoin");
  const tc = await ConnectContract(tcSigner);
  const tcAddr = await tcSigner.getAddress();
  const mintSigner = await getSigner("Minter");
  const mint = await ConnectContract(mintSigner);
  const mintAddr = await mintSigner.getAddress();

  const roles = await tc.getRoles();

  // Update minter and add 10,000 Coins (aprox $40K)
  if (roles[1] !== mintAddr) {
    console.log("Assigning Roles...");
    await tc.setMinter(mintAddr);
    await mint.acceptMinter();
  }

  const tcBal = await mint.balanceOf(tcAddr);
  if (tcBal.toNumber() === 0) {
    await mint.mintCoins(10000 * COIN_EXP);
  }

  await seedAccount(tc, tcAddr, "client1");
  await seedAccount(tc, tcAddr, "client2");
}

async function seedAccount(tc: TheCoin, tcAddr: string, clientName: AccountName) {
  const clientSigner = await getSigner(clientName);
  const client = await ConnectContract(clientSigner);
  const clientAddress = await clientSigner.getAddress();
  // Assign ~15 transactions to client randomly in the past
  console.log("Seeding account: " + clientAddress);
  const now = DateTime.local();
  const toSeconds = (dt: DateTime) => Math.floor(dt.toMillis() / 1000);

  for (
    let ts = now.minus({ years: 1 });
    ts < now;
    ts = ts.plus({ days: 45 * Math.random() })
  ) {
    // either purchase or sell up to 100 coins
    const amount = Math.floor(Math.random() * 100 * COIN_EXP);
    const balance = await tc.balanceOf(clientAddress);
    if (balance.toNumber() <= amount || Math.random() < 0.6) {
      await tc.coinPurchase(clientAddress, amount, 0, toSeconds(ts));
    }
    else {
      // TODO: Our redemption function is not gass-less.  We need
      // to unify our functionality to enable processing these functions
      await client.coinPurchase(tcAddr, amount, 0, toSeconds(ts));
    }
  }
}
