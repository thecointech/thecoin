const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const path = require('path');
const { writeFileSync } = require('fs');
import { namedAccounts } from '../src/utils'

module.exports = (artifacts: Truffle.Artifacts) => {
  return async (
    deployer: Truffle.Deployer,
    network: string,
    accounts: string[]
  ) => {

    const TheCoin = artifacts.require("TheCoin");

    const { acTheCoin } = namedAccounts(accounts);
    const proxy = await deployProxy(TheCoin, [acTheCoin], { deployer });

    // Our contract-specific data (eg impl address, ProxyAdmin address) is in ../.openzeppelin/{network}.json

    // Serialize our contract addresses
    const jsonFile = path.join(__dirname, '..', 'src', 'deployed', `${network}.json`);
    writeFileSync(jsonFile, JSON.stringify({
      proxy: proxy.address,
      //timestamp: new Date(),
    }))
  }
}
