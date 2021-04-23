import { IAccountStoreAPI } from '@thecointech/shared/containers/AccountMap';
import testWallet from './testAccount1.json';
import Thisismy from './Thisismy.wallet.json';
import { Wallet } from 'ethers';
import { AccountName, getSigner } from '@thecointech/accounts';
import { TheSigner } from '@thecointech/shared/SignerIdent';

export const wallets = [
  {
    id: "123",
    name: "TestAccNoT",
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

// Fetch some wallets to test with.
// We always add 1 encrypted wallet at the
// end (to be able to test login);
export function addDevAccounts(accountsApi: IAccountStoreAPI) {

  // if dev mode, we add a random wallet,
  if (process.env.SETTINGS !== 'live') {
    accountsApi.addAccount('Random Test', Wallet.createRandom(), false, true);
  }
  // We always add one encrypted wallet
  const encrypted = wallets[0];
  accountsApi.addAccount(encrypted.name, JSON.parse(encrypted.wallet), false, false);
}

export async function addDevLiveAccounts(accountsApi: IAccountStoreAPI) {
  // if dev:live we add 2 connected wallets.
  addRemoteAccount('client1', accountsApi);
  addRemoteAccount('client2', accountsApi);
}

async function addRemoteAccount(name: AccountName, accountsApi: IAccountStoreAPI) {
  const signer = await getSigner(name)
  const address = await signer.getAddress();
  const theSigner = signer as TheSigner;
  theSigner.address = address;
  theSigner._isSigner = true;

  accountsApi.addAccount(name, theSigner, false, true);
}
