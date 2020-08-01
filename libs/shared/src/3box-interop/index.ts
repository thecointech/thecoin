import { isWallet } from "SignerIdent";
import Box from '3box';
import IdentityWallet from 'identity-wallet';
import { Wallet } from "ethers";
import { AccountState } from "containers/Account";
import { GetWeb3 } from "containers/Account/Web3";

const getConsent = () => {
  return true
}

//
// Initialize the 3box service.  This should be called on page
// load so 3box can startup the required services (eg IPFS etc)
export function initialize()
{

}

//
// Open the users 3box application space
export function login3Box({signer}: AccountState) {
  // Call identity wallet web3 or local account
  // isWallet = Web3 ; isSigner = local account
  const connection = (isWallet(signer)
    ? login3BoxWallet(signer)
    : login3BoxWeb3(signer.address));

  return connection;
}

export function login3BoxWallet(wallet: Wallet) {
  let idWallet = new IdentityWallet(getConsent, { mnemomic: wallet.mnemonic })
  let threeIdProvider = idWallet.get3idProvider()
  let box = Box.openBox(null, threeIdProvider)
  return box
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
