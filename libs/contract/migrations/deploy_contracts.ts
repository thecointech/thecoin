// Fetch the Storage contract data from the Storage.json file
const TheCoin = artifacts.require("TheCoin");;
const { namedAccounts } = require('../utils');
const { deployProxy, getProxyAdminFactory, getProxyFactory } = require('@openzeppelin/truffle-upgrades');
const path = require('path');
const { writeFileSync } = require('fs')

module.exports = async function (deployer, network, accounts) {
  const { acTheCoin } = namedAccounts(accounts);
  const proxy = await deployProxy(TheCoin, [acTheCoin], { deployer });

  // Our contract-specific data (eg impl address, ProxyAdmin address) is in ../.openzeppelin/{network}.json

  // Serialize our contract addresses
  const jsonFile = path.join(__dirname, '..', 'src', 'deployed', `${network}.json`);
  writeFileSync(jsonFile, JSON.stringify({
    proxy: proxy.address,
    //timestamp: new Date(),
   }))
};
