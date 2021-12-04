import { MigrationStep } from './step';
import "../../../tools/setenv";
import { storeContractAddress } from '@thecointech/contract-tools/migrations';
import { getArguments, getName } from './deploy';
import { deployProxy } from '@openzeppelin/truffle-upgrades';

const step: MigrationStep =  (artifacts) =>
  async (deployer, network) => {
    const name = getName(network);
    const contract = artifacts.require(name);

    const contractArgs = await getArguments(network)
    //@ts-ignore
    const proxy = await deployProxy(contract, contractArgs, { deployer });
    // Serialize our contract addresses
    storeContractAddress(__dirname, network, proxy.address, ['cjs', 'mjs']);
  }

module.exports = step
