import { Contract } from 'ethers';
import { TheCoin } from './codegen';
import TheCoinSpec from './codegen/contracts/TheCoin.sol/TheCoin.json' assert {type: "json"};
import { getProvider } from '@thecointech/ethers-provider';

//
// Ensure your .env specifies where this contract was deployed at
// (used in fetching history to prevent searching too far back!)
export const InitialCoinBlock = parseInt(process.env.INITIAL_COIN_BLOCK ?? "0", 10);

const getAbi = () => TheCoinSpec.abi;
export const getContractAddress = async () : Promise<string> => {

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
  ) as TheCoin

declare module globalThis {
  let __contract: TheCoin|undefined;
}

export async function GetContract() : Promise<TheCoin> {
  if (!globalThis.__contract) {
    globalThis.__contract= await buildContract();
  }
  return globalThis.__contract;
}
