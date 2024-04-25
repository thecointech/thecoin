import { Wallet } from 'ethers';
import { getAndCacheSigner } from './cache';
import type { AccountName } from "./names";

function loadFromPK(name: AccountName) {
  const pk = process.env[`WALLET_${name}_KEY`];
  if (!pk)
    throw new Error(`Cannot find process.env.WALLET_${name}_KEY: ensure all accounts are exposed`);
  return new Wallet(pk);
}

//
// Prodtest should use private keys defined in .env file.
export * from './names';
export const getSigner = (name: AccountName) =>
  getAndCacheSigner(name, () => loadFromPK(name));
