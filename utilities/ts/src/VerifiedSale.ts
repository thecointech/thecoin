import { BrokerCAD } from "@the-coin/types/lib/BrokerCAD";
import { ethers, Signer } from "ethers";
import { BuildVerifiedXfer } from "./VerifiedTransfer";

// ---------------------------------------------------------\\

function GetSaleHash(
  toEmail: string,
  transfer: BrokerCAD.CertifiedTransferRequest
) {
  return ethers.utils.solidityKeccak256(
    ["string", "string"],
    [transfer.signature, toEmail]
  );
}

export async function BuildVerifiedSale(
  toEmail: string,
  from: Signer,
  to: string,
  value: number,
  fee: number
) {
  const xfer = await BuildVerifiedXfer(from, to, value, fee);
  const saleHash = GetSaleHash(toEmail, xfer);
  const saleSig = await from.signMessage(saleHash);

  const r: BrokerCAD.CertifiedSale = {
    transfer: xfer,
    clientEmail: toEmail,
    signature: saleSig
  };
  return r;
}

export function GetSaleSigner(sale: BrokerCAD.CertifiedSale) {
  const { transfer, clientEmail, signature } = sale;
  const hash = GetSaleHash(clientEmail, transfer);
  return ethers.utils.verifyMessage(hash, signature);
}
