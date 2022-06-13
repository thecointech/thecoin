import { Wallet } from '@ethersproject/wallet';
import { getAndCacheSigner } from './cache.js'
import type { AccountName } from './names';

export * from './names.js';
export const getSigner = async (name: AccountName) =>
  getAndCacheSigner(name, () => Wallet.createRandom())
