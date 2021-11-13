import { MigrationStep } from './step';
import { getContract } from './deploy';
import { storeContractAddress } from '@thecointech/contract-tools/migrations'

const step: MigrationStep = () =>
  async (deployer, network, _accounts) => {

    const nftContract = await getContract(deployer, network);
    // Serialize our contract addresses
    storeContractAddress(__dirname, network, nftContract.address);
  }


module.exports = step
