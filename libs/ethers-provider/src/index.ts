import type { JsonRpcProvider } from 'ethers';
import type { Network } from './types';
export type { Network } from './types';

//
// Declare a prototype that matches the getProvider implementation in each wassname provider
// If no deploy target is specified it defaults to "POLYGON";
export const getProvider = (_deployTo?: Network) : JsonRpcProvider => {
  throw new Error("Type-only declaration not meant to be executed");
};
