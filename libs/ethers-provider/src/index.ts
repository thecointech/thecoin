import { Provider } from '@ethersproject/providers';

// Declare a prototype that matches the getProvider implementation in each wassname provider
// If no deploy target is specified it defaults to "POLYGON";
export const getProvider = (_deployTo?: "POLYGON"|"ETHERUM") : Provider => {
  throw new Error("Type-only declaration not meant to be executed");
};
