
import { COIN_EXP } from "../src/contract";
import { DateTime } from 'luxon';
import { NamedAccounts } from "./accounts";
import { TheCoin } from './deploy';

export async function initializeDevLive(contract: TheCoin, accounts: NamedAccounts) {

  const tcBal = await contract.balanceOf(accounts.TheCoin);
  if (tcBal.toNumber() === 0) {
    await contract.mintCoins(10000 * COIN_EXP, 0, { from: accounts.Minter });
  }

  await seedAccount(contract, accounts.TheCoin, accounts.client1);
  await seedAccount(contract, accounts.TheCoin, accounts.client2);
  // Also seed TestAccNoT so we can test tx's with a wallet vs a signer
  await seedAccount(contract, accounts.TheCoin, "0x445758e37f47b44e05e74ee4799f3469de62a2cb", true);

  // Send a decent amount to BrokerCAD
  await contract.exactTransfer(accounts.TheCoin, accounts.BrokerCAD, 5000 * COIN_EXP, 0, { from: accounts.TheCoin });
}

async function seedAccount(contract: TheCoin, theCoin: string, client: string, onlyBuy=false) {

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
    if (onlyBuy || balance.toNumber() <= amount || Math.random() < 0.6) {
      await contract.exactTransfer(theCoin, client, amount, toSeconds(ts), { from: theCoin });
    }
    else {
      // TODO: Our redemption function is not gass-less.  We need
      // to unify our functionality to enable processing these functions
      await contract.exactTransfer(client, theCoin, amount, toSeconds(ts), { from: client });
    }
  }
}
