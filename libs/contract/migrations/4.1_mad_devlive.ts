
import { COIN_EXP } from "../src/contract";
import { DateTime } from 'luxon';
import { TheCoinInstance } from "./types/TheCoin";
import { NamedAccounts } from "./accounts";

export async function initializeDevLive(contract: TheCoinInstance, accounts: NamedAccounts) {

  const tcBal = await contract.balanceOf(accounts.TheCoin);
  if (tcBal.toNumber() === 0) {
    await contract.mintCoins(10000 * COIN_EXP, { from: accounts.Minter });
  }

  await seedAccount(contract, accounts.TheCoin, accounts.client1);
  await seedAccount(contract, accounts.TheCoin, accounts.client2);
}

async function seedAccount(contract: TheCoinInstance, theCoin: string, client: string) {

  // Assign ~15 transactions to client randomly in the past
  console.log("Seeding account: " + client);
  const now = DateTime.local();
  const toSeconds = (dt: DateTime) => Math.floor(dt.toMillis() / 1000);

  for (
    let ts = now.minus({ years: 1 });
    ts < now;
    ts = ts.plus({ days: 45 * Math.random() })
  ) {
    // either purchase or sell up to 100 coins
    const amount = Math.floor(Math.random() * 100 * COIN_EXP);
    const balance = await contract.balanceOf(client);
    if (balance.toNumber() <= amount || Math.random() < 0.6) {
      await contract.coinPurchase(client, amount, 0, toSeconds(ts), { from: theCoin });
    }
    else {
      // TODO: Our redemption function is not gass-less.  We need
      // to unify our functionality to enable processing these functions
      await contract.coinPurchase(theCoin, amount, 0, toSeconds(ts), { from: client });
    }
  }
}
