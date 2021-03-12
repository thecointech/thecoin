import testWallet from './testAccount1.json';
import Thisismy from './Thisismy.wallet.json';
import { AccountMap, IAccountMapActions, initialState, useAccountMapApi } from "@the-coin/shared/containers/AccountMap";
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

let firstRun = true;
export function useInjectedSigners() {
  const mapApi = useAccountMapApi();
  // On first run, inject new signers.We can't
  // use useEffect here because it will delay
  // the execution too long (we render the app
  // with no accounts and redirect to addAccount)
  if (firstRun) {
    // always insert default wallet
    //addDevWallet();
    // In dev:live mode, we also connect to default
    // accounts from local develop blockchain.
    if (process.env.SETTINGS === "live") {
      addDevLiveSigners(mapApi)
    }
  }
}

// const accountToLoad = wallets[1];
// const walletToLoad = JSON.parse(accountToLoad.wallet);
// const initReducer = new AccountMap(initialState, initialState);
// initReducer.addAccount(walletToLoad.name, walletToLoad, false);

// function addDevWallet() {
//   const accountToLoad = wallets[1];
//   const walletToLoad = JSON.parse(accountToLoad.wallet);
//   const initReducer = new AccountMap(initialState, initialState);
//   initReducer.addAccount(walletToLoad.name, walletToLoad, false);
// }

async function addDevLiveSigners(mapApi: IAccountMapActions) {
  const client1 = await getSigner("client1")
  const address = await client1.getAddress();
  const theSigner = client1 as TheSigner;

  theSigner.address = address;
  theSigner._isSigner = true;
  mapApi.addAccount("Client1", theSigner, false);
  mapApi.setActiveAccount(address);
}
