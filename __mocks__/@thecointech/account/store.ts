import { IAccountStoreAPI } from '@thecointech/shared/containers/AccountMap';
import testWallet from './testAccount1.json';
import Thisismy from './Thisismy.wallet.json';
import { Wallet } from 'ethers';
import { AccountName, getSigner } from '@thecointech/signers';
import { TheSigner } from '@thecointech/utilities/SignerIdent';
import { ConnectContract } from '../contract';
import { MockIDX } from '../idx';
import { AccountMap, buildNewAccount } from '@thecointech/account';

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

// Make some wallets to test with.  There should be at
// least 1 unlocked wallet, and the locked TestAccNoT
function buildDevWallets() {
  const encrypted = wallets[0];
  const encryptedAccount = buildNewAccount(encrypted.name, JSON.parse(encrypted.wallet));
  // We always add one encrypted wallet
  const r: AccountMap = {
    [encryptedAccount.address]: encryptedAccount
  }
  // if dev mode, we add a random wallet,
  if (process.env.SETTINGS !== 'live') {
    const randomAccount = buildNewAccount("Random Test", Wallet.createRandom());
    // connect to mocked services - normally this is done by "connect" call
    randomAccount.contract = ConnectContract();
    randomAccount.idx = new MockIDX() as any;
    r[randomAccount.address] = randomAccount
  }
  return r;
}

let _devWallets = buildDevWallets();
export const getAllAccounts = () => _devWallets;

export async function addDevLiveAccounts(accountsApi: IAccountStoreAPI) {
  // if dev:live we add 2 connected wallets.
  addRemoteAccount('client1', accountsApi, true);
  addRemoteAccount('client2', accountsApi, false);
}

async function addRemoteAccount(name: AccountName, accountsApi: IAccountStoreAPI, active: boolean) {
  const signer = await getSigner(name)
  const address = await signer.getAddress();
  const theSigner = signer as TheSigner;
  theSigner.address = address;
  theSigner._isSigner = true;

  accountsApi.addAccount(name, theSigner, false, active);
}
