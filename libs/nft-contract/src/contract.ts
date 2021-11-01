import { Contract } from '@ethersproject/contracts';
import { TheGreenNFT } from '.';
import { getProvider } from './provider';
import TheGreenNFTSpec from './contracts/TheGreenNFTL2.json';

const getAbi = () => {
  return TheGreenNFTSpec.abi;
}

const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME
const getContractAddress = () => {
  console.log(`Loading NFT contract for: ${config_env}`);
  try {
    // For now, we run exclusively on Polygon
    const deployment = require(`./deployed/${config_env}-polygon.json`);
    console.log('Loaded succesfully');
    return deployment.contract;
  } catch (err) {
    console.error(`We failed to load ./deployed/${config_env}.json`)
    throw new Error('Cannot create contract: missing deployment');
  }
}

const buildContract = () =>
  new Contract(
    getContractAddress(),
    getAbi(),
    getProvider()
  ) as TheGreenNFT

declare module globalThis {
  let __contractNFT: TheGreenNFT | undefined;
}

export function getContract(): TheGreenNFT {
  globalThis.__contractNFT = globalThis.__contractNFT ?? buildContract();
  return globalThis.__contractNFT!;
}
