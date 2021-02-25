
const TheCoin = artifacts.require("TheCoin");;
const { namedAccounts, setMinter } = require('../utils');
const { time } = require('@openzeppelin/test-helpers');

async function timeIncreaseTo (seconds) {
  const delay = 1000 - new Date().getMilliseconds();
  await new Promise(resolve => setTimeout(resolve, delay));
  await time.increaseTo(seconds);
}

module.exports = async function (deployer, network, accounts) {
  // On development blockchain, seed accounts with random data
  if (network == 'development') {
    const proxy = await TheCoin.deployed();
    const {acTheCoin, acMinter, client1, client2} = namedAccounts(accounts);

    const roles = await proxy.getRoles();

    // Update minter and add 10,000 Coins (aprox $40K)
    await setMinter(proxy, acMinter, acTheCoin);
    await proxy.mintCoins(10000 * 1000000).send({from: acMinter});

    // Assign 10 transactions to client1 randomly in the past
  }
};
