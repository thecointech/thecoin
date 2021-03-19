import { Contract } from 'ethers/contract';
import { TheCoin } from './types/TheCoin';
import { getProvider } from './provider';

//
// Multiplier of base values to human-readable fractions (eg $ and c)
export const COIN_EXP = 1000000;

//
// TODO: This is hard-coded at our current contract,
// and will cause issues on all non-production environments
export const InitialCoinBlock = parseInt(process.env.INITIAL_COIN_BLOCK ?? "0");

const getAbi = async () => {
	const TheCoinSpec = await import('./contracts/TheCoin.json');
	if (!TheCoinSpec)
		throw new Error('Cannot create contract: missing contract spec');

  return TheCoinSpec.abi;
}

const getContractAddress = async () => {
  const deployment = await import(`./deployed/${process.env.DEPLOY_NETWORK}.json`);
  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.proxy;
}

const buildContract = async () =>
  new Contract(
    await getContractAddress(),
    await getAbi(),
    getProvider()
  ) as TheCoin

declare module globalThis {
  let __contract: TheCoin|undefined;
}

export async function GetContract() : Promise<TheCoin> {
  if (!globalThis.__contract) {
    globalThis.__contract= await buildContract();
  }
  return globalThis.__contract!;
}
