import Crypto from "crypto";
import { CertifiedTransferRequest, UberTransfer } from "@thecointech/types";
import { keccak256 } from '@ethersproject/solidity';

export type EncryptedPacket = {
  encryptedPacket: string;
  version: string;
};

const publicCert = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6GirjYahDl+YBGtCqMx0
xnmms0Nbc93HhmYg+2k6/lcwl5dwnAWsbEDEuQPaeOGkDlaQyvuYnNB/IHyHf4/h
J65gJYD7DelMBoxCBk0PgMrqVys5Y2Wx6Fuxhc39k2eRsZ0ws6jU1Nc3mYh3Bb9r
lhaC51WXWCLVDPdV7XoH8LTa+qJs/BreWT/1G7i+TMD1wOJJKYsc81lnvUxHopr7
wPD9kBROpJ8IOO9Kd2lNMRw+cX1V1iFoFDCNDZPw71yDgExOEZChcG5lybD7fqAp
LM6N3WvacmDnzLjHp2vsTzC2A8gO5xVqwY+pFH8YOX185uA5pWiR0/JTWSvwkS4D
4wIDAQAB
-----END PUBLIC KEY-----`;

const certVersion = "1.0.1";

export function encrypt(object: Object) {
  const toEncrypt = JSON.stringify(object);
  const bufferPayee = Buffer.from(toEncrypt);
  const encryptedPayee = Crypto.publicEncrypt(publicCert, bufferPayee);

  const r: EncryptedPacket = {
    encryptedPacket: encryptedPayee.toString("base64"),
    version: certVersion
  };
  return r;
}

export function decrypt(privateKey: string, value: string) {
  const buffer = Buffer.from(value, "base64");
  const output = Crypto.privateDecrypt(privateKey, buffer);
  return output.toString();
}


export function decryptTo<T>(privateKey: string, encrypted: EncryptedPacket): T
{
  const asString = decrypt(privateKey, encrypted.encryptedPacket);
  return JSON.parse(asString) as T;
}

export function GetHash(
  encryptedPayee: EncryptedPacket,
  transfer: CertifiedTransferRequest|UberTransfer
) {
  return keccak256(
    ["string", "string", "string"],
    [
      transfer.signature,
      encryptedPayee.encryptedPacket,
      encryptedPayee.version
    ]
  );
}
