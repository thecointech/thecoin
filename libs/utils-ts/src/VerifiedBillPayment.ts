import { BillPayeePacket, CertifiedTransfer } from "@thecointech/types";
import { BuildVerifiedAction } from "./VerifiedAction";
import type { Signer } from "@ethersproject/abstract-signer";

export const BuildVerifiedBillPayment = async (
  payee: BillPayeePacket,
  from: Signer,
  to: string,
  value: number,
  fee: number
): Promise<CertifiedTransfer> => BuildVerifiedAction(payee, from, to, value, fee);
