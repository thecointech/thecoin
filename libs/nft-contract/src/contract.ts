import { Contract } from '@ethersproject/contracts';
import { TheCoinNFT } from './types/TheCoinNFT';
import { getProvider } from './provider';
import TheCoinNFTSpec from './contracts/TheCoinNFT.json';

const getAbi = () => {
  return TheCoinNFTSpec.abi;
}

const getContractAddress = () => {
  console.log(`Loading NFT contract for: ${process.env.CONFIG_NAME}`);
  try {
    const deployment = require(`./deployed/${process.env.CONFIG_NAME}.json`);
    console.log('Loaded succesfully');
    return deployment.contract;
  } catch (err) {
    console.error(`We failed to load ./deployed/${process.env.CONFIG_NAME}.json`)
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

//
// A simple workaround to force the TS compiler to copy the file
export async function forceCompilerToCopyFile() {
  const deployment = await import(`./deployed/${process.env.CONFIG_NAME}.json`);
  return deployment.contract;
}
