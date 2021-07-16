import { Contract } from 'ethers/contract';
import { TheCoin } from './types/TheCoin';
import { getProvider } from './provider';
import TheCoinSpec from './contracts/TheCoin.json';
//
// Multiplier of base values to human-readable fractions (eg $ and c)
export const COIN_EXP = 1000000;

//
// Ensure your .env specifies where this contract was deployed at
// (used in fetching history to prevent searching too far back!)
export const InitialCoinBlock = parseInt(process.env.INITIAL_COIN_BLOCK ?? "0", 10);

const getAbi = () => TheCoinSpec.abi;

const getContractAddress = () => {
  const deployment = require(`./deployed/${process.env.CONFIG_NAME}.json`);
  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.proxy;
}

const buildContract = () =>
  new Contract(
    getContractAddress(),
    getAbi(),
    getProvider()
  ) as TheCoin

declare module globalThis {
  let __contract: TheCoin|undefined;
}

export function GetContract() : TheCoin {
  if (!globalThis.__contract) {
    globalThis.__contract= buildContract();
  }
  return globalThis.__contract;
}
