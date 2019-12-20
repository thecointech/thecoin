import { BrokerCAD } from "@the-coin/types/lib/BrokerCAD";
import { ethers, Signer } from "ethers";
import { BuildVerifiedXfer } from "./VerifiedTransfer";
import { encrypt, GetHash } from "./Encrypt";

// ---------------------------------------------------------\\

export async function BuildVerifiedSale(
  eTransfer: BrokerCAD.ETransferPacket,
  from: Signer,
  to: string,
  value: number,
  fee: number,
) {
  const xfer = await BuildVerifiedXfer(from, to, value, fee);
  const encryptedETransfer = encrypt(eTransfer);
  const saleHash = GetHash(encryptedETransfer, xfer);
  const signature = await from.signMessage(saleHash);

  const r: BrokerCAD.CertifiedSale = {
    transfer: xfer,
    encryptedETransfer,
    signature
  };
  return r;
}

export function GetSaleSigner(sale: BrokerCAD.CertifiedSale) {
  const { transfer, encryptedETransfer, signature } = sale;
  if (encryptedETransfer)
  {
    const hash = GetHash(encryptedETransfer, transfer);
    return ethers.utils.verifyMessage(hash, signature);  
  }
  return false;
}
