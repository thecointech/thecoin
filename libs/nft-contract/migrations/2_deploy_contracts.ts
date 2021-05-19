import path from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { MigrationStep } from './types';
import { getSigner } from '@thecointech/accounts';

const step: MigrationStep = (artifacts) =>
  async (deployer, network, _accounts) => {

    const nftContract = artifacts.require("TheCoinNFT");

    // Create with minter assigned.
    const minter = await getSigner('Minter');
    const mintAddress = await minter.getAddress();
    // Deploy the NFT contract.
    await deployer.deploy(nftContract, mintAddress);

    // Serialize our contract addresses
    const outdir = path.join(__dirname, '..', 'src', 'deployed');
    if (!existsSync(outdir))
      mkdirSync(outdir);

    // Our contract-specific data (eg impl address, ProxyAdmin address etc) is in ../.openzeppelin/{network}.json
    const jsonFile = path.join(outdir, `${network}.json`);
    writeFileSync(jsonFile, JSON.stringify({
      contract: nftContract.address,
    }))

  }

module.exports = step
