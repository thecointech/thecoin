import { getProvider, Network } from '@thecointech/ethers-provider';
import { TheGreenNFTL2, TheGreenNFTL2__factory } from './codegen';

// const getAbi = (network: Network) => {
//   return network == "POLYGON"
//     ? TheGreenNFT2Spec.abi
//     : TheGreenNFT1Spec.abi;
// }

const getContractAddress = async (network: Network) => {
  const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME
  const deployment = await import(`./deployed/${config_env}-${network.toLowerCase()}.json`, { assert: { type: 'json' } });

  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.default.contract;
}

declare module globalThis {
  let __contractNFT: TheGreenNFTL2 | undefined;
}

export async function getContract(network: Network = "POLYGON") {
  globalThis.__contractNFT ??= TheGreenNFTL2__factory.connect(
    await getContractAddress(network),
    await getProvider()
  );
  return globalThis.__contractNFT!;
}
