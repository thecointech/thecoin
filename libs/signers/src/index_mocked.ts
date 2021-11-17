import { Wallet } from '@ethersproject/wallet';
import {getAndCacheSigner } from './cache'
import { AccountName } from './names';

export * from './names';
export const getSigner = async (name: AccountName) =>
  getAndCacheSigner(name, () => Wallet.createRandom())
