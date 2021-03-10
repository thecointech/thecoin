import testWallet from './testAccount1.json';
import Thisismy from './Thisismy.wallet.json';
import { AccountMap, initialState } from "@the-coin/shared/containers/AccountMap";
import { getSigner } from '@the-coin/utilities/blockchain';
import { TheSigner } from '@the-coin/shared/SignerIdent';

export const wallets = [
  {
    id: "123",
    name: "TestAccNoT First.wallet.json",
    type: "Type?",
    wallet: JSON.stringify(testWallet),
  },
  {
    id: "345",
    name: "TestAccNoT Another",
    type: "Type?",
    wallet: JSON.stringify(testWallet),
  },
  {
    id: "789",
    name: "This is my.wallet.json",
    type: "Type?",
    wallet: JSON.stringify(Thisismy),
  }
];

// We automatically insert one of these accounts into our local store
// This code assumes that our reducer has already been initialized
const walletToLoad = wallets[1];
const initReducer = new AccountMap(initialState, initialState);
initReducer.addAccount(walletToLoad.name, testWallet as any, false);

if (process.env.NODE_ENV !== 'production' && process.env.SETTINGS === "live") {
  // In dev-live mode, we automatically connect to default accounts
  // from the debug blockchain.
  getSigner("client1")
    .then(async client1 => {
      const address = await client1.getAddress();
      const theSigner = client1 as TheSigner;
      theSigner.address = address;
      theSigner._isSigner = true;
      initReducer.addAccount("Client1", theSigner, false);
      initReducer.setActiveAccount(address);
    })
}
