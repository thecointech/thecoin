import { Contract } from '@ethersproject/contracts';
import { TheGreenNFT } from '.';
import { getProvider, Network } from '@thecointech/ethers-provider';
import TheGreenNFT1Spec from './codegen/contracts/ethereum/TheGreenNFTL1.sol/TheGreenNFTL1.json' assert {type: "json"};
import TheGreenNFT2Spec from './codegen/contracts/polygon/TheGreenNFTL2.sol/TheGreenNFTL2.json' assert {type: "json"};

const getAbi = (network: Network) => {
  return network == "POLYGON"
    ? TheGreenNFT2Spec.abi
    : TheGreenNFT1Spec.abi;
}

const getContractAddress = async (network: Network) => {
  const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME
  const deployment = await import(`./deployed/${config_env}-${network.toLowerCase()}.json`, { assert: { type: 'json' } });

  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.default.contract;
}

const buildContract = async (network: Network) =>
  new Contract(
    await getContractAddress(network),
    getAbi(network),
    getProvider(),
  ) as TheGreenNFT

declare module globalThis {
  let __contractNFT: TheGreenNFT | undefined;
}

export async function getContract(network: Network = "POLYGON"): Promise<TheGreenNFT> {
  globalThis.__contractNFT = globalThis.__contractNFT ?? await buildContract(network);
  return globalThis.__contractNFT!;
}
