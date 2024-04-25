import { Contract } from 'ethers';
import type { UberConverter } from './codegen/contracts/UberConverter';
import UberSpec from './codegen/contracts/UberConverter.sol/UberConverter.json' assert {type: "json"};
import { getProvider } from '@thecointech/ethers-provider';

const getAbi = () => UberSpec.abi;
const getContractAddress = async () => {

  const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME;
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
    getProvider()
  ) as UberConverter

declare module globalThis {
  let __uberConverter: UberConverter|undefined;
}

export async function getContract() : Promise<UberConverter> {
  if (!globalThis.__uberConverter) {
    globalThis.__uberConverter= await buildContract();
  }
  return globalThis.__uberConverter;
}
