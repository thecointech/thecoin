import Crypto from "crypto";
import { CertifiedTransferRequest, UberTransfer } from "@thecointech/types";
import { getBytes, solidityPackedKeccak256 } from 'ethers';
import { log } from "@thecointech/logging";

export type EncryptedPacket = {
  encryptedPacket: string;
  version: string;
};

// !!!! prodtest needs a copy of this key !!!!
// const publicCert = `-----BEGIN PUBLIC KEY-----
// MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6GirjYahDl+YBGtCqMx0
// xnmms0Nbc93HhmYg+2k6/lcwl5dwnAWsbEDEuQPaeOGkDlaQyvuYnNB/IHyHf4/h
// J65gJYD7DelMBoxCBk0PgMrqVys5Y2Wx6Fuxhc39k2eRsZ0ws6jU1Nc3mYh3Bb9r
// lhaC51WXWCLVDPdV7XoH8LTa+qJs/BreWT/1G7i+TMD1wOJJKYsc81lnvUxHopr7
// wPD9kBROpJ8IOO9Kd2lNMRw+cX1V1iFoFDCNDZPw71yDgExOEZChcG5lybD7fqAp
// LM6N3WvacmDnzLjHp2vsTzC2A8gO5xVqwY+pFH8YOX185uA5pWiR0/JTWSvwkS4D
// 4wIDAQAB
// -----END PUBLIC KEY-----`;

// const certVersion = "1.0.1";

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

export function decrypt(privateKey: string, value: string) {
  const buffer = Buffer.from(value, "base64");
  const output = Crypto.privateDecrypt(privateKey, buffer);
  return output.toString();
}

export async function decryptTo<T>(encrypted: EncryptedPacket): Promise<T|null>
{
  // NOTE: server does not have private key, and will not pass this step
  const privateKeyPath = process.env.USERDATA_INSTRUCTION_KEY_PRIVATE_FILE;
  if (!privateKeyPath) {
    return null;
  }

  // This file can be loaded within Admin electron browser, so
  // we delay import (fs) to allow loading in that environment
  const { readFileSync } = await import('fs');
  const privateKey = readFileSync(privateKeyPath, 'utf8');
  if (!privateKey) {
    log.error("Attempting to decrypt instructions, but no private key is present");
    return null;
  }

  const asString = decrypt(privateKey, encrypted.encryptedPacket);
  return JSON.parse(asString) as T;
}

export function GetHash(
  encryptedPayee: EncryptedPacket,
  transfer: CertifiedTransferRequest|UberTransfer
) {
  return getBytes(
    solidityPackedKeccak256(
      ["string", "string", "string"],
      [
        transfer.signature,
        encryptedPayee.encryptedPacket,
        encryptedPayee.version
      ]
    )
  );
}
