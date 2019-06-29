import { BuildVerifiedXfer } from "./VerifiedTransfer";
import { BrokerCAD } from "@the-coin/types/lib/BrokerCAD";
import { ethers, Signer } from "ethers";
import Crypto from "crypto";
//import ecKeyUtils from 'eckey-utils';
//import EthCrypto from 'eth-crypto';

const publicCert = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6GirjYahDl+YBGtCqMx0
xnmms0Nbc93HhmYg+2k6/lcwl5dwnAWsbEDEuQPaeOGkDlaQyvuYnNB/IHyHf4/h
J65gJYD7DelMBoxCBk0PgMrqVys5Y2Wx6Fuxhc39k2eRsZ0ws6jU1Nc3mYh3Bb9r
lhaC51WXWCLVDPdV7XoH8LTa+qJs/BreWT/1G7i+TMD1wOJJKYsc81lnvUxHopr7
wPD9kBROpJ8IOO9Kd2lNMRw+cX1V1iFoFDCNDZPw71yDgExOEZChcG5lybD7fqAp
LM6N3WvacmDnzLjHp2vsTzC2A8gO5xVqwY+pFH8YOX185uA5pWiR0/JTWSvwkS4D
4wIDAQAB
-----END PUBLIC KEY-----`;

const certVersion = "1.0.0";

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
// We encrypt the payee info on-device.  This is to ensure
// that even if someone does gain access to the server
export async function EncryptPayee(wallet: Signer, name: string, payee: BrokerCAD.BillPayeePacket)
{
  if (
    !(payee.payee ? payee.accountNumber : !payee.accountNumber) || // XOR payee details
    (name ? false : !payee.payee)
  ) {
    // We have bad data
    throw "Invalid data supplied";
  }

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


  const toEncrypt = JSON.stringify(payee);
  const bufferPayee = Buffer.from(toEncrypt);
  const encryptedPayee = Crypto.publicEncrypt(publicCert, bufferPayee);

  const r: BrokerCAD.EncryptedPacket = {
    encryptedPacket: encryptedPayee.toString("base64"),
    name,
    version: certVersion
  };
  return r;
}

function decrypt(privateKey: string, value: string)
{
  const buffer = Buffer.from(value, "base64");
  const output = Crypto.privateDecrypt(privateKey, buffer);
  return output.toString();
}

// export function DecryptName(wallet: Signer, encryptedName: string)
// {
//   return decrypt(wallet.privateKey, encryptedName);
// }
export function DecryptPayee(privateKey: string, encrypted: BrokerCAD.EncryptedPacket)
{
  const asString = decrypt(privateKey, encrypted.encryptedPacket);
  return JSON.parse(asString) as BrokerCAD.BillPayeePacket;
}

function GetHash(
  encryptedPayee: BrokerCAD.EncryptedPacket,
  transfer: BrokerCAD.CertifiedTransferRequest
) {
  const name = encryptedPayee.name || "";
  // Name is included, but neither account # or payee
  return ethers.utils.solidityKeccak256(
    ["string", "string", "string", "string"],
    [
      transfer.signature,
      name,
      encryptedPayee.encryptedPacket,
      encryptedPayee.version
    ]
  );
}

export async function BuildVerifiedBillPayment(
  payee: BrokerCAD.BillPayeePacket,
  name: string,
  from: Signer,
  to: string,
  value: number,
  fee: number
) {
  const xfer = await BuildVerifiedXfer(from, to, value, fee);
  const encryptedPayee = await EncryptPayee(from, name, payee);
  const billHash = GetHash(encryptedPayee, xfer);
  const billSig = await from.signMessage(billHash);

  const r: BrokerCAD.CertifiedBillPayment = {
    transfer: xfer,
    encryptedPayee: encryptedPayee,
    signature: billSig
  };
  return r;
}

export function GetBillPaymentSigner(sale: BrokerCAD.CertifiedBillPayment) {
  const { transfer, encryptedPayee, signature } = sale;
  const hash = GetHash(encryptedPayee, transfer);
  return ethers.utils.verifyMessage(hash, signature);
}
