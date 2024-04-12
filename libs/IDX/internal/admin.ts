import { DID } from 'dids'
import { getResolver } from 'key-did-resolver'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { fromString } from 'uint8arrays/from-string'

export async function getAdminDID() {
  // Hexadecimal-encoded private key for a DID having admin access to the target Ceramic node
  const privateKeyHex = process.env.CERAMIC_SEED;
  if (!privateKeyHex) {
    throw new Error('Missing CERAMIC_SEED environment variable');
  }
  const privateKey = fromString(privateKeyHex, 'base16')
  const adminDid = new DID({
    resolver: getResolver(),
    provider: new Ed25519Provider(privateKey),
  })
  await adminDid.authenticate();
  return adminDid;
}
