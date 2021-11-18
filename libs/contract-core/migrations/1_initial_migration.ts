import { MigrationStep } from './step';
import "../../../tools/setenv";
import { storeContractAddress } from '@thecointech/contract-tools/migrations';
import { getArguments, getName } from './deploy';
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const step: MigrationStep =  (artifacts) =>
  async (deployer, network) => {
    const name = getName(network);
    const contract = artifacts.require(name as "TheCoin");

    const contractArgs = await getArguments(network)
    const proxy = await deployProxy(contract, contractArgs, { deployer });
    // Serialize our contract addresses
    storeContractAddress(__dirname, network, proxy.address, ['cjs', 'mjs']);
  }

module.exports = step
