import { SigningKey, Wallet, getBytes, hexlify, keccak256, toUtf8Bytes, computeAddress, encodeBase64, decodeBase64 } from "ethers";
import type { EncryptedBlob, Recipient } from "./types";

const KEY_LEN = 32;
const COMPRESSED_PUBKEY_LEN = 33;
const IV_LEN = 12;

async function getCrypto(): Promise<Crypto> {
  if (globalThis.crypto?.subtle) return globalThis.crypto;
  const { webcrypto } = await import("crypto");
  return webcrypto as unknown as Crypto;
}

const getSubtle = async () => (await getCrypto()).subtle;

async function randomBytes(len: number): Promise<Uint8Array> {
  const r = new Uint8Array(len);
  (await getCrypto()).getRandomValues(r);
  return r;
}

const b64 = (b: Uint8Array) => encodeBase64(b);
const unb64 = (s: string) => new Uint8Array(decodeBase64(s));

// ECIES key-wrap: shared = ephemeralPriv * recipientPub, mask = keccak256(shared).
// The mask is unique per ephemeral key, so XOR is a one-time pad.
function wrapKey(dataKey: Uint8Array, recipientPub: string) {
  const ephemeral = Wallet.createRandom().signingKey;
  const shared = getBytes(ephemeral.computeSharedSecret(recipientPub));
  const mask = getBytes(keccak256(shared));
  const wrapped = dataKey.map((b, i) => b ^ mask[i]);
  return hexlify(new Uint8Array([...getBytes(ephemeral.compressedPublicKey), ...wrapped]));
}

function unwrapKey(entry: Uint8Array, privateKey: string): Uint8Array {
  const ephemeralPub = hexlify(entry.slice(0, COMPRESSED_PUBKEY_LEN));
  const wrapped = entry.slice(COMPRESSED_PUBKEY_LEN);
  const shared = getBytes(new SigningKey(privateKey).computeSharedSecret(ephemeralPub));
  const mask = getBytes(keccak256(shared));
  return wrapped.map((b, i) => b ^ mask[i]);
}

// Encrypt `data` (any JSON-serializable value) so that each recipient
// can independently decrypt it using their private key.
export async function encryptObject(data: unknown, recipients: Recipient[]): Promise<EncryptedBlob> {
  if (!recipients.length) throw new Error("encryptObject requires at least one recipient");
  const subtle = await getSubtle();
  const dataKey = await randomBytes(KEY_LEN);
  const iv = await randomBytes(IV_LEN);

  const key = await subtle.importKey("raw", dataKey as BufferSource, "AES-GCM", false, ["encrypt"]);
  const cipher = new Uint8Array(await subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    toUtf8Bytes(JSON.stringify(data)) as BufferSource,
  ));

  const wrappedKeys: Record<string, string> = {};
  for (const r of recipients) {
    wrappedKeys[computeAddress(r.pubKey)] = b64(getBytes(wrapKey(dataKey, r.pubKey)));
  }

  return { v: 1, iv: b64(iv), cipher: b64(cipher), wrappedKeys };
}

// Decrypt a blob.  `privateKey` is the raw key of one of the recipients;
// its address is used to locate the appropriate wrapped key.
export async function decryptObject(blob: EncryptedBlob, privateKey: string): Promise<unknown> {
  const address = computeAddress(privateKey);
  const entry = blob.wrappedKeys[address];
  if (!entry) throw new Error(`No wrapped key for ${address}`);

  const subtle = await getSubtle();
  const dataKey = unwrapKey(unb64(entry), privateKey);
  const key = await subtle.importKey("raw", dataKey as BufferSource, "AES-GCM", false, ["decrypt"]);
  const plain = await subtle.decrypt(
    { name: "AES-GCM", iv: unb64(blob.iv) as BufferSource },
    key,
    unb64(blob.cipher) as BufferSource,
  );
  return JSON.parse(new TextDecoder().decode(plain));
}
