import { Firestore } from '@the-coin/types';
import { Wallet } from 'ethers';

type TheCoinGlobals = {
  firestore: Firestore|null;
  wallets: {
    [name: string]: Wallet;
  }
}
declare global {
  namespace globalThis {
    //  deepcode ignore no-var-keyword: var is necessary for this typing to work
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

