import testWallet from './testAccount1.json';
import Thisismy from './Thisismy.wallet.json';
import { IAccountMapActions, useAccountMapApi } from "@the-coin/shared/containers/AccountMap";
import { getSigner } from '@the-coin/utilities/blockchain';
import { TheSigner } from '@the-coin/shared/SignerIdent';
import { useEffect } from 'react';

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

// In dev-live mode, we automatically connect to default accounts
// from the debug blockchain.

export function useInjectedSigners() {
  const mapApi = useAccountMapApi();
  // On first run, inject new signers signers
  useEffect(() => { injectSigners(mapApi) }, []);
}

async function injectSigners(mapApi: IAccountMapActions) {
  // We automatically insert one of these accounts into our local store
  // This code assumes that our reducer has already been initialized
  const walletToLoad = wallets[1];
  mapApi.addAccount(walletToLoad.name, testWallet as any, false);

  if (process.env.SETTINGS === "live") {
    const client1 = await getSigner("client1")
    const address = await client1.getAddress();
    const theSigner = client1 as TheSigner;

    theSigner.address = address;
    theSigner._isSigner = true;
    mapApi.addAccount("Client1", theSigner, false);
    mapApi.setActiveAccount(address);
  }
}
