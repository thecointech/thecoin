import { DIDSession } from 'did-session'
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum'
import { ComposeClient }from '@composedb/client'
import { getDefintions } from './definition';
import { Ethers3Web3Converter } from './ethers2web3';
import type { Signer } from "ethers";
import { setSigner } from './oneOffDid';

export async function getComposeDB(signer: Signer) {

  const ceramicUrl = process.env.CERAMIC_URL
  if (!ceramicUrl) {
    throw new Error("Missing CERAMIC_URL")
  }

  const address = await signer.getAddress();
  const shim = new Ethers3Web3Converter(signer);
  const accountId = await getAccountId(shim, address)
  const authMethod = await EthereumWebAuth.getAuthMethod(shim, accountId)
  const definition = await getDefintions()
  const compose = new ComposeClient({
    ceramic: ceramicUrl,
    definition,
  })

  const session = await DIDSession.authorize(authMethod, { resources: compose.resources })
  compose.setDID(session.did);
  setSigner(compose, signer);
  return compose;
}
