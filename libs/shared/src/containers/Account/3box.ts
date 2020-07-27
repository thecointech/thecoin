import { TheSigner, isWallet } from "SignerIdent";
import Box from '3box';
import IdentityWallet from 'identity-wallet';

const getConsent = async () => {
  return true
}

export async function login3Box(signer: TheSigner)
{
  // Call identity wallet web3 or local account
  // isWallet = Web3 ; isSigner = local account
  const connection = await (isWallet(signer)
    ? login3BoxWallet(signer.mnemonic)
    : login3BoxWeb3(signer.address));

}

export async function login3BoxWallet(menmonic: string){
    let idWallet = new IdentityWallet(getConsent, { seed: privateKey } )
    let threeIdProvider = idWallet.get3idProvider()
    let box = yield Box.openBox(null, threeIdProvider)
    yield box.syncDone
    yield this.sendValues(this.actions().updateWithValues, { box: box });
    return box
  }

export async function login3BoxWeb3(address: string){
    const provider = yield Box.get3idConnectProvider() // recomended provider
    const box = yield Box.openBox(address, provider)
    yield box.syncDone
    yield this.sendValues(this.actions().updateWithValues, { box: box });
    return box
  }
