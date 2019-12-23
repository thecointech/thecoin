import { BrokerCAD } from "@the-coin/types";
import { Signer, ethers } from "ethers";
import { BuildVerifiedXfer } from "./VerifiedTransfer";
import { encrypt, GetHash } from "./Encrypt";

// TODO: Propage this throught code base (not yet done)
export type InstructionPacket = BrokerCAD.BillPayeePacket|BrokerCAD.ETransferPacket;

export async function BuildVerifiedAction(
  packet: InstructionPacket,
  from: Signer,
  to: string,
  value: number,
  fee: number) 
: Promise<BrokerCAD.CertifiedTransfer>
{
  const xfer = await BuildVerifiedXfer(from, to, value, fee);
  const instructionPacket = encrypt(packet);
  const saleHash = GetHash(instructionPacket, xfer);
  const signature = await from.signMessage(saleHash);

  return {
    transfer: xfer,
    instructionPacket,
    signature
  };
}

export function GetSigner(sale: BrokerCAD.CertifiedTransfer) {
  const { transfer, instructionPacket, signature } = sale;
  if (instructionPacket)
  {
    const hash = GetHash(instructionPacket, transfer);
    return ethers.utils.verifyMessage(hash, signature);  
  }
  return false;
}
