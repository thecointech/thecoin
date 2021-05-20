import { Contract } from 'ethers/contract';
import { TheCoinNFT } from './types/TheCoinNFT';
import { getProvider } from './provider';

const getAbi = async () => {
	const TheCoinSpec = await import('./contracts/TheCoinNFT.json');
	if (!TheCoinSpec)
		throw new Error('Cannot create contract: missing contract spec');

  return TheCoinSpec.abi;
}

const getContractAddress = async () => {
  const deployment = await import(`./deployed/${process.env.CONFIG_NAME}.json`);
  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.contract;
}

const buildContract = async () =>
  new Contract(
    await getContractAddress(),
    await getAbi(),
    getProvider()
  ) as TheCoinNFT

declare module globalThis {
  let __contractNFT: TheCoinNFT|undefined;
}

export async function getContract() : Promise<TheCoinNFT> {
  globalThis.__contractNFT = globalThis.__contractNFT ?? await buildContract();
  return globalThis.__contractNFT!;
}
