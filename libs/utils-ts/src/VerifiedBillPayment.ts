import { BillPayeePacket, CertifiedTransfer } from "@thecointech/types";
import { Signer } from "ethers";
import { BuildVerifiedAction } from "./VerifiedAction.js";


export const BuildVerifiedBillPayment = async (
  payee: BillPayeePacket,
  from: Signer,
  to: string,
  value: number,
  fee: number
): Promise<CertifiedTransfer> => BuildVerifiedAction(payee, from, to, value, fee);
