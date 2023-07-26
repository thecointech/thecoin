import { BuildVerifiedXfer } from "./VerifiedTransfer";
import { encrypt, GetHash } from "./Encrypt";
import { sign } from "./SignedMessages";
import { verifyMessage } from '@ethersproject/wallet';
import type { Signer } from "@ethersproject/abstract-signer";
import type { BillPayeePacket, ETransferPacket, CertifiedTransfer, UberTransferAction } from "@thecointech/types";

// TODO: Propage this throught code base (not yet done)
export type InstructionPacket = BillPayeePacket|ETransferPacket;

export async function BuildVerifiedAction(
  packet: InstructionPacket,
  from: Signer,
  to: string,
  value: number,
  fee: number)
: Promise<CertifiedTransfer>
{
  const xfer = await BuildVerifiedXfer(from, to, value, fee);
  const instructionPacket = encrypt(packet);
  const saleHash = GetHash(instructionPacket, xfer);
  const signature = await sign(saleHash, from);

  return {
    transfer: xfer,
    instructionPacket,
    signature
  };
}

export function getSigner(sale: CertifiedTransfer|UberTransferAction) {
  const { transfer, instructionPacket, signature } = sale;
  const hash = GetHash(instructionPacket, transfer);
  return verifyMessage(hash, signature);
}
