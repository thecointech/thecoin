import { getProvider, Network } from '@thecointech/ethers-provider';
import { TheGreenNFTL2, TheGreenNFTL2__factory } from './codegen';
import { defineContractBaseSingleton } from '@thecointech/contract-base';
import type { Provider } from 'ethers';
// const getAbi = (network: Network) => {
//   return network == "POLYGON"
//     ? TheGreenNFT2Spec.abi
//     : TheGreenNFT1Spec.abi;
// }

const getContractAddress = async (network: Network) => {
  const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME
  const deployment = await import(`./deployed/${config_env}-${network.toLowerCase()}.json`, { with: { type: 'json' } });

  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.default.contract;
}

export const ContractNFT = defineContractBaseSingleton<TheGreenNFTL2, [Network?, Provider?]>('__nft', async (network="POLYGON", provider) => {
  return TheGreenNFTL2__factory.connect(
    await getContractAddress(network),
    provider ?? await getProvider()
  )
});
