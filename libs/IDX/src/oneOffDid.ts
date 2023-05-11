import { DID } from 'dids'
import { getResolver } from 'key-did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { fromString } from 'uint8arrays/from-string'
import { keccak256 } from '@ethersproject/keccak256';
import { Signer } from '@ethersproject/abstract-signer';
import { ComposeClient } from '@composedb/client';

// create a one-off DID for encrypting profile data.
// This is to work-around the single-use DID's created by DIDSession
export function setSigner(client: ComposeClient, signer: Signer) {
  (client as any).__signer = signer;
}

function getSigner(client: ComposeClient|Signer) {
  if ((client as any)._isSigner) {
    return client as Signer;
  }
  const signer = (client as any).__signer as Signer;
  if (!signer) {
    throw new Error("Client is missing signer");
  }
  return signer;
}

export async function getOneOffEncryptDid(client: ComposeClient|Signer) {
  const signer = getSigner(client);
  // Hexadecimal-encoded private key for a DID having admin access to the target Ceramic node
  const msg = await signer.signMessage("This gives permission to read or write profile data");
  const privateKey = fromString(keccak256(msg).slice(2), 'base16')
  const oneOffDid = new DID({
    resolver: getResolver(),
    provider: new Ed25519Provider(privateKey),
  })
  await oneOffDid.authenticate();
  return oneOffDid;
}
