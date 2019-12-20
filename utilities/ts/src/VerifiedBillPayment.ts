import { BuildVerifiedXfer } from "./VerifiedTransfer";
import { BrokerCAD } from "@the-coin/types/lib/BrokerCAD";
import { ethers, Signer } from "ethers";
import { encrypt, GetHash } from "./Encrypt";

// We encrypt the payee info on-device.  This is to ensure
// that even if someone does gain access to the server
export function EncryptPayee(wallet: Signer, name: string, payee: BrokerCAD.BillPayeePacket)
{
  if (
    !(payee.payee ? payee.accountNumber : !payee.accountNumber) || // XOR payee details
    (name ? false : !payee.payee)
  ) {
    // We have bad data
    throw "Invalid data supplied";
  }

  return encrypt(payee);
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
  const encryptedPayee = EncryptPayee(from, name, payee);
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
