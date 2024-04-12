import { Contract } from '@ethersproject/contracts';
import type { ShockAbsorber } from './codegen/contracts/ShockAbsorber';
import UberSpec from './codegen/contracts/ShockAbsorber.sol/ShockAbsorber.json' assert {type: "json"};
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
  ) as ShockAbsorber

declare module globalThis {
  let __shockAbsorber: ShockAbsorber|undefined;
}

export async function getContract() : Promise<ShockAbsorber> {
  if (!globalThis.__shockAbsorber) {
    globalThis.__shockAbsorber= await buildContract();
  }
  return globalThis.__shockAbsorber;
}
