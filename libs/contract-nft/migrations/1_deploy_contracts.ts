import { MigrationStep } from './step';
import { getContract } from './deploy';
import { writeContractFile } from '@thecointech/contract-tools/migrations'

const step: MigrationStep = () =>
  async (deployer, network, _accounts) => {

    const nftContract = await getContract(deployer, network);

    // Serialize our contract addresses
    writeContractFile('src', network, nftContract.address);

    // Our build system seems to be failing to pick up
    // the changes to the address in repeated build steps.
    // We end-run around the problem by also writing the output
    // directly to the build folder as well.
    writeContractFile('build', network, nftContract.address);
  }


module.exports = step
