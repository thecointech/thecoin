import { Wallet } from '@ethersproject/wallet';
import { getAndCacheSigner } from './cache';
import type { AccountName } from './names';

export * from './names';
export const getSigner = async (name: AccountName) =>
  getAndCacheSigner(name, () => Wallet.createRandom())
