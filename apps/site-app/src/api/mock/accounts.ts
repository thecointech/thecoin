import testWallet from './testAccount1.json';
import Thisismy from './Thisismy.wallet.json';
import { accountMapApi, useActiveAccount } from "@the-coin/shared/containers/AccountMap";
import { getSigner } from '@the-coin/utilities/blockchain';
import { isSigner, TheSigner } from '@the-coin/shared/SignerIdent';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { useAccountApi } from '@the-coin/shared/containers/Account';

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
  const dispatch = useDispatch();
  // On first run, inject new signers signers
  useEffect(() => { injectSigners(dispatch) }, []);

  useUpdateOnActiveChanged();
}

async function injectSigners(dispatch: Dispatch) {
  // We automatically insert one of these accounts into our local store
  // This code assumes that our reducer has already been initialized
  const walletToLoad = wallets[1];
  const mapApi = accountMapApi(dispatch)
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

//
// This function ensures our injected accounts get initialized properly
// TODO: This is risky because it changes some pretty core behaviour
// between dev & testing.  There is probably a more generic method to
// ensure this happens on all accounts (not just the accounts we inject here).
function useUpdateOnActiveChanged() {
  const activeAccount = useActiveAccount();
  const api = useAccountApi(activeAccount?.address!);

  if (activeAccount?.contract === null && isSigner(activeAccount?.signer)) {
    api.setSigner(activeAccount.signer);
  }
}
