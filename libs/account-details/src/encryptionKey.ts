import { SigningKey, Signature, concat, keccak256 } from "ethers";
import type { Signer } from "ethers";

// The encryption key is derived from a signature over a fixed message.
// This works with any signer (local, JSON-RPC, hardware, browser wallet),
// as none of them expose their private key or an ECDH primitive.
// It relies on the signer producing deterministic (RFC 6979) signatures.
// Changing this message changes every derived key: bump the version
// (and EncryptedBlob.v) if it must ever change.
export const getEncryptionKeyMessage = (address: string) =>
  `TheCoin: unlock encrypted account data\nAccount: ${address}\nVersion: 1`;

// Cache per address, so remote signers only prompt once per session
const cache = new Map<string, Promise<SigningKey>>();

async function deriveKey(signer: Signer, address: string) {
  const raw = await signer.signMessage(getEncryptionKeyMessage(address));
  // Use only r & s: signers differ in how they encode v (0/1 vs 27/28)
  const { r, s } = Signature.from(raw);
  return new SigningKey(keccak256(concat([r, s])));
}

export async function getEncryptionKey(signer: Signer): Promise<SigningKey> {
  const address = await signer.getAddress();
  let key = cache.get(address);
  if (!key) {
    key = deriveKey(signer, address);
    cache.set(address, key);
    // Don't cache failures (eg user rejected the signing prompt)
    key.catch(() => cache.delete(address));
  }
  return key;
}
