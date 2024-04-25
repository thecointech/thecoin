import { buildUberTransfer } from "./UberTransfer";
import { encrypt, GetHash } from "./Encrypt";
import { sign } from "./SignedMessages";
import type { Signer } from "ethers";
import type { BillPayeePacket, ETransferPacket, UberTransferAction } from "@thecointech/types";
import type { DateTime } from 'luxon';
import type Decimal from 'decimal.js-light';
// TODO: Propage this throught code base (not yet done)
export type InstructionPacket = BillPayeePacket|ETransferPacket;

export async function BuildUberAction(
  packet: InstructionPacket,
  from: Signer,
  to: string,
  amount: Decimal,
  currency: number,
  transferAt: DateTime)
: Promise<UberTransferAction>
{
  const xfer = await buildUberTransfer(from, to, amount, currency, transferAt);
  const instructionPacket = encrypt(packet);
  const saleHash = GetHash(instructionPacket, xfer);
  const signature = await sign(saleHash, from);

  return {
    transfer: xfer,
    instructionPacket,
    signature
  };
}
