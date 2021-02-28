// Fetch the Storage contract data from the Storage.json file
const TheCoin = artifacts.require("TheCoin");;
const { namedAccounts } = require('../utils');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function (deployer, _network, accounts) {
  const { acTheCoin } = namedAccounts(accounts);
  await deployProxy(TheCoin, [acTheCoin], { deployer });
};
