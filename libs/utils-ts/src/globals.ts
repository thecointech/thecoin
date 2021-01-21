import { Wallet } from 'ethers';

type TheCoinGlobals = {
  firestore: any;
  wallets: {
    [name: string]: Wallet;
  }
}
declare global {
  namespace globalThis {
    var __thecoin: TheCoinGlobals
  }
}
// initialize to empty
globalThis.__thecoin = {
  firestore: null,
  wallets: {}
}
export function setGlobal(val: Partial<TheCoinGlobals>) {
  globalThis.__thecoin = {
    ...globalThis.__thecoin,
    ...val,
  }
}

// globalThis.__thecoin = {
//   firestore: null,
//   wallets: {},
// };

