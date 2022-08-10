import { Contract } from '@ethersproject/contracts';
import { TheGreenNFT } from '.';
import { getProvider } from '@thecointech/ethers-provider';
import TheGreenNFTSpec from './contracts/contracts/polygon/TheGreenNFTL2.sol/TheGreenNFTL2.json' assert {type: "json"};

const getAbi = () => {
  return TheGreenNFTSpec.abi;
}

const getContractAddress = async () => {
  const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME
  const deployment = await import(`./deployed/${config_env}-polygon.json`, { assert: { type: 'json' } });

  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.default.contract;
}

const buildContract = async () =>
  new Contract(
    await getContractAddress(),
    getAbi(),
    getProvider(),
  ) as TheGreenNFT

declare module globalThis {
  let __contractNFT: TheGreenNFT | undefined;
}

export async function getContract(): Promise<TheGreenNFT> {
  globalThis.__contractNFT = globalThis.__contractNFT ?? await buildContract();
  return globalThis.__contractNFT!;
}
