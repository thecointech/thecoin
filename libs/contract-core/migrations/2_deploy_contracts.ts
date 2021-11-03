import { MigrationStep } from './step';
import { storeContractAddress } from '@thecointech/contract-tools/migrations'
import { getContract } from './deploy';

const step: MigrationStep = () =>
  async (deployer, network, _accounts) => {

    const contract = await getContract(deployer, network);
    // Serialize our contract addresses
    storeContractAddress(__dirname, network, contract.address);
  }

module.exports = step
