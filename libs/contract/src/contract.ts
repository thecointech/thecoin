import { Contract } from 'ethers/contract';
import { TheCoin } from '../types/ethers-contracts/TheCoin';
import { getNetwork } from './network';
import { getProvider } from './provider';

const getAbi = async () => {
	const TheCoinSpec = await import('./contracts/TheCoin.json');
	if (!TheCoinSpec)
		throw new Error('Cannot create contract: missing contract spec');

  return TheCoinSpec.abi;
}

const getContractAddress = async () => {
  const network = getNetwork();
  const deployment = await import(`./deployed/${network}.json`);
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
  return globalThis.__contract
}
