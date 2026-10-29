export type * from "./types.basic";
export type * from "./types.kyc";
export type * from "./types.preferences";

// An encrypted JSON blob.  The data is AES-256-GCM encrypted with a
// random data key, which is then wrapped (ECIES) once per recipient.
// Each wrapped entry is `ephemeralPubKey(33B) || wrappedDataKey(32B)`,
// base64-encoded, keyed by the recipients normalized address.
export type EncryptedBlob = {
  v: 1;
  // base64
  iv: string;
  // base64
  cipher: string;
  // recipient address -> base64(ephemeralPub || wrappedKey)
  wrappedKeys: Record<string, string>;
}

export type Recipient = {
  // Normalized ethereum address of the recipient (used as map key)
  address: string;
  // Recipients public key (compressed or uncompressed)
  pubKey: string;
}
