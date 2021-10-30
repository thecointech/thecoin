import path from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { MigrationStep } from './step';
import { getContract } from './deploy';

const step: MigrationStep = () =>
  async (deployer, network, _accounts) => {

    const nftContract = await getContract(deployer, network);

    // Serialize our contract addresses
    writeOutputFile('src', network, nftContract.address);

    // Our build system seems to be failing to pick up
    // the changes to the address in repeated build steps.
    // We end-run around the problem by also writing the output
    // directly to the build folder as well.
    writeOutputFile('build', network, nftContract.address);
  }


function writeOutputFile(dest: string, network: string, address: string) {

  const outdir = path.join(__dirname, '..', dest, 'deployed');
  if (!existsSync(outdir))
    mkdirSync(outdir);

  // Our contract-specific data (eg impl address, ProxyAdmin address etc) is in ../.openzeppelin/{network}.json
  const jsonFile = path.join(outdir, `${network}.json`);
  writeFileSync(jsonFile, JSON.stringify({
    contract: address,
  }))
}

module.exports = step
