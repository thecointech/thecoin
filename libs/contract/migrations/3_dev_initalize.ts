import { namedAccounts, setMinter } from '../src/utils';
import { COIN_EXP } from "../src";
import { DateTime } from 'luxon';

module.exports = (artifacts: Truffle.Artifacts) => {
  return async (
    _deployer: Truffle.Deployer,
    network: string,
    accounts: string[]
  ) => {
    // On development blockchain, seed accounts with random data
    if (network == 'development') {

      const TheCoin = artifacts.require("TheCoin");
      const proxy = await TheCoin.deployed();
      const { acTheCoin, acMinter, client1, client2 } = namedAccounts(accounts);

      const roles = await proxy.getRoles();

      // Update minter and add 10,000 Coins (aprox $40K)
      if (roles[1] != acMinter) {
        await setMinter(proxy, acMinter, acTheCoin);
      }
      const tcBal = await proxy.balanceOf(acTheCoin);
      if (tcBal.toNumber() == 0) {
        await proxy.mintCoins(10000 * COIN_EXP, { from: acMinter });
      }

      await seedAccount(proxy, acTheCoin, client1);
      await seedAccount(proxy, acTheCoin, client2);
    }
  }

  async function seedAccount(proxy: any, acTheCoin: string, client: string) {
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
      const balance = await proxy.balanceOf(client);
      if (balance.toNumber() <= amount || Math.random() < 0.6) {
        console.log(`Purchasing ${amount / COIN_EXP} at: ${ts}`);
        await proxy.coinPurchase(client, amount, 0, toSeconds(ts), { from: acTheCoin });
      }
      else {
        console.log(`Selling ${amount / COIN_EXP} at: ${ts}`);
        await proxy.coinRedeem(amount, acTheCoin, toSeconds(ts), { from: client });
      }
    }
  }
}
