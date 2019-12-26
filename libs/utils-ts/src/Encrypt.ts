import Crypto from "crypto";
import { BrokerCAD } from "@the-coin/types";
import { ethers } from "ethers";

//import ecKeyUtils from 'eckey-utils';
//import EthCrypto from 'eth-crypto';



// function buildPemKey(wallet: Signer) {
//   const curveName = 'secp256k1';
//   const ecdh = Crypto.createECDH(curveName);
//   ecdh.setPrivateKey(wallet.privateKey.substr(2), "hex");
  
//   return ecKeyUtils.generatePem({
//     curveName,
//     privateKey: ecdh.getPrivateKey(),
//     publicKey: ecdh.getPublicKey()
//   });
// }

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
  //   // create identitiy with key-pairs and address
  //   const alice = EthCrypto.createIdentity();
  //   const secretMessage = 'My name is Satoshi Buterin';
  //   const encrypted = await EthCrypto.encryptWithPublicKey(
  //       alice.publicKey, // encrypt with alice's publicKey
  //       secretMessage
  //   );

  //   const publicKey = EthCrypto.publicKeyByPrivateKey(
  //     wallet.privateKey
  // );
  //   const encrypted2 = await EthCrypto.encryptWithPublicKey(
  //     publicKey, // encrypt with alice's publicKey
  //     name
  //   );
  const toEncrypt = JSON.stringify(object);
  const bufferPayee = Buffer.from(toEncrypt);
  const encryptedPayee = Crypto.publicEncrypt(publicCert, bufferPayee);

  const r: BrokerCAD.EncryptedPacket = {
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


export function decryptTo<T>(privateKey: string, encrypted: BrokerCAD.EncryptedPacket): T
{
  const asString = decrypt(privateKey, encrypted.encryptedPacket);
  return JSON.parse(asString) as T;
}

export function GetHash(
  encryptedPayee: BrokerCAD.EncryptedPacket,
  transfer: BrokerCAD.CertifiedTransferRequest
) {
  return ethers.utils.solidityKeccak256(
    ["string", "string", "string"],
    [
      transfer.signature,
      encryptedPayee.encryptedPacket,
      encryptedPayee.version
    ]
  );
}