import { COIN_EXP } from "../src/contract";
import { DateTime } from 'luxon';
import { TheCoinInstance } from './types/TheCoin';
import { toNamedAccounts } from '../src/accounts';

const deploy: MigrationStep = (artifacts) =>
  async (_deployer, network, accounts) => {
    // On development blockchain, seed accounts with random data
    if (network === 'development') {

      const contract = artifacts.require("TheCoin");
      const proxy = await contract.deployed();
      const { TheCoin, Minter, client1, client2 } = toNamedAccounts(accounts);

      const roles = await proxy.getRoles();

      // Update minter and add 10,000 Coins (aprox $40K)
      if (roles[1] !== Minter) {
        await setMinter(proxy, Minter, TheCoin);
      }
      const tcBal = await proxy.balanceOf(TheCoin);
      if (tcBal.toNumber() === 0) {
        await proxy.mintCoins(10000 * COIN_EXP, { from: Minter });
      }

      await seedAccount(proxy, TheCoin, client1);
      await seedAccount(proxy, TheCoin, client2);
    }
  }

  async function setMinter(proxy: TheCoinInstance, Minter: string, TheCoin: string) {
    await proxy.setMinter(Minter, { from: TheCoin });
    await proxy.acceptMinter({ from: Minter });
  }

  async function seedAccount(proxy: TheCoinInstance, TheCoin: string, client: string) {
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
        await proxy.coinPurchase(client, amount, 0, toSeconds(ts), { from: TheCoin });
      }
      else {
        await proxy.coinRedeem(amount, TheCoin, toSeconds(ts), { from: client });
      }
    }
  }

module.exports = deploy;
