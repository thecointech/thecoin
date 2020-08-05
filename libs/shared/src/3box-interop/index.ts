import { isWallet, AnySigner } from "SignerIdent";
import Box from '3box';
import IdentityWallet from 'identity-wallet';
import { Wallet } from "ethers";
import { AccountState } from "containers/Account";
import { GetWeb3 } from "containers/Account/Web3";
import { HDNode } from "ethers/utils";

const getConsent = () => {
  return true
}

let box = null as Box|null;
//
// Initialize the 3box service.  This should be called on page
// load so 3box can startup the required services (eg IPFS etc)
export async function initialize()
{
  if (box == null) {
    box = await Box.create();
  }
  return box as Box;
}

//
// Open the users 3box application space
export function login3Box(signer: AnySigner) {
  // Call identity wallet web3 or local account
  // isWallet = Web3 ; isSigner = local account
  const connection = (isWallet(signer)
    ? login3BoxWallet(signer)
    : login3BoxWeb3(signer.address));

  return connection;
}

export async function login3BoxWallet(wallet: Wallet) {

  const idWallet = new IdentityWallet(getConsent, {
    seed: HDNode.mnemonicToSeed(wallet.mnemonic)
  });
  const box = await Box.openBox(null, idWallet.get3idProvider(), {
    consentCallback: getConsent,
    disableRendezvous: true,
  });
  // await box.auth(["TheCoin"], {
  //   address: wallet.address,
  //   provider: ,
  // })
  return box;
}

export async function login3BoxWeb3(address: string) {
  const { web3 } = GetWeb3();
  const box = Box.openBox(address, web3);
  return box
}

// If we publish these functions from here, then all 3box
// functionality can be limited to this one file
export async function getData<T>(_account: AccountState, _name: string): Promise<T|undefined> {
  return undefined;
}

export async function setData<T>(_account: AccountState, _name: string, _data: T) {
}

export async function deleteData(_account: AccountState, _name: string) {

}
