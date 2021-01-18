import { Wallet } from 'ethers';

declare global {
  namespace globalThis {
    var __thecoin: {
      firestore: any;
      wallets: {
        [name: string]: Wallet;
      }
    }
  }
}

// globalThis.__thecoin = {
//   firestore: null,
//   wallets: {},
// };

