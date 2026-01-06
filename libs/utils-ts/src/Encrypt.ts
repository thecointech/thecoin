import Crypto from "crypto";

export type EncryptedPacket = {
  encryptedPacket: string;
  version: string;
};

export function encrypt(object: Object) {
  const publicCert = process.env.USERDATA_INSTRUCTION_KEY_PUBLIC;
  const keyVersion = process.env.USERDATA_INSTRUCTION_KEY_VERSION;
  if (!publicCert) {
    throw new Error("Cannot encrypt, missing USERDATA_INSTRUCTION_KEY_PUBLIC public key")
  }
  if (!keyVersion) {
    throw new Error("Cannot encrypt, missing USERDATA_INSTRUCTION_KEY_VERSION key version")
  }

  const toEncrypt = JSON.stringify(object);
  const bufferPayee = Buffer.from(toEncrypt);
  const encryptedPayee = Crypto.publicEncrypt(publicCert, bufferPayee);

  const r: EncryptedPacket = {
    encryptedPacket: encryptedPayee.toString("base64"),
    version: keyVersion
  };
  return r;
}
