import { TheSigner, isWallet } from "SignerIdent";
import Box from '3box';
import IdentityWallet from 'identity-wallet';

const getConsent = () => {
  return true
}

export function login3Box(signer: TheSigner) {
  // Call identity wallet web3 or local account
  // isWallet = Web3 ; isSigner = local account
  const connection = (isWallet(signer)
    ? login3BoxWallet(signer.mnemonic)
    : login3BoxWeb3(signer.address));

  return connection;
}

export function login3BoxWallet(menmonic: string) {
  let idWallet = new IdentityWallet(getConsent, { menmonic })
  let threeIdProvider = idWallet.get3idProvider()
  let box = Box.openBox(null, threeIdProvider)
  return box
}

export async function login3BoxWeb3(address: string) {
  const provider = Box.get3idConnectProvider() // recomended provider
  const box = Box.openBox(address, provider)
  return box
}
