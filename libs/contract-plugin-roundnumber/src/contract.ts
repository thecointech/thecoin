import { Contract } from '@ethersproject/contracts';
import { RoundNumber } from './codegen';
import RoundNumberSpec from './codegen/contracts/RoundNumber.sol/RoundNumber.json' assert {type: "json"};
import { getProvider } from '@thecointech/ethers-provider';

const getAbi = () => RoundNumberSpec.abi;
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
  ) as RoundNumber

declare module globalThis {
  let __roundnumber: RoundNumber|undefined;
}

export async function getContract() : Promise<RoundNumber> {
  if (!globalThis.__roundnumber) {
    globalThis.__roundnumber= await buildContract();
  }
  return globalThis.__roundnumber;
}
