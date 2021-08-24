import { Contract } from '@ethersproject/contracts';
import { TheCoinNFT } from './types/TheCoinNFT';
import { getProvider } from './provider';
import TheCoinNFTSpec from './contracts/TheCoinNFT.json';

const getAbi = () => {
  return TheCoinNFTSpec.abi;
}

const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME
const getContractAddress = () => {
  console.log(`Loading NFT contract for: ${config_env}`);
  try {
    const deployment = require(`./deployed/${config_env}.json`);
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
  ) as TheCoinNFT

declare module globalThis {
  let __contractNFT: TheCoinNFT | undefined;
}

export function getContract(): TheCoinNFT {
  globalThis.__contractNFT = globalThis.__contractNFT ?? buildContract();
  return globalThis.__contractNFT!;
}
