import { BillPayeePacket, CertifiedTransfer } from "@thecointech/types";
import { BuildVerifiedAction } from "./VerifiedAction";
import type { Signer } from "ethers";
import type { TimeSource } from "./TimeSource";

export const BuildVerifiedBillPayment = async (
  payee: BillPayeePacket,
  from: Signer,
  to: string,
  value: number,
  fee: number,
  timeSource: TimeSource,
): Promise<CertifiedTransfer> => BuildVerifiedAction(payee, from, to, value, fee, timeSource);
