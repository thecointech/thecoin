
const TheCoin = artifacts.require("TheCoin");;
const { namedAccounts, setMinter } = require('../utils');
const { time } = require('@openzeppelin/test-helpers');

const COIN_EXP = 1000000

module.exports = async function (deployer, network, accounts) {
  // On development blockchain, seed accounts with random data
  if (network == 'development') {
    const proxy = await TheCoin.deployed();
    const {acTheCoin, acMinter, client1, client2} = namedAccounts(accounts);

    const roles = await proxy.getRoles();

    // Update minter and add 10,000 Coins (aprox $40K)
    if (roles[1] != acMinter) {
      await setMinter(proxy, acMinter, acTheCoin);
    }
    const tcBal = await proxy.balanceOf(acTheCoin);
    if (tcBal.toNumber() == 0) {
      await proxy.mintCoins(10000 * COIN_EXP, {from: acMinter});
    }

    await seedAccount(proxy, acTheCoin, client1);
    await seedAccount(proxy, acTheCoin, client2);
  }
};

async function seedAccount(proxy, acTheCoin, client) {
  // Assign ~15 transactions to client randomly in the past
  console.log("Seeding account: " + client);
  const now = Math.floor(Date.now() / 1000);
  for (
    let ts = now - time.duration.years(1);
    ts < now;
    ts += time.duration.days(45 * Math.random()).toNumber()
  ) {
    // either purchase or sell up to 100 coins
    const amount = Math.floor(Math.random() * 100 * COIN_EXP);
    const balance = await proxy.balanceOf(client);
    if (balance.lte(web3.utils.toBN(amount)) || Math.random() < 0.6) {
      console.log(`Purchasing ${amount / COIN_EXP} at: ${new Date(ts * 1000)}`);
      await proxy.coinPurchase(client, amount, 0, ts, { from: acTheCoin });
    }
    else {
      console.log(`Selling ${amount / COIN_EXP} at: ${new Date(ts * 1000)}`);
      await proxy.coinRedeem(amount, acTheCoin, ts, { from: client });
    }
  }
}
