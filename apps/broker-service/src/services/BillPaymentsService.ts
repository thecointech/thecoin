import { ProcessBillPayment } from '../exchange/VerifiedBillPayments';
import { CertifiedTransfer } from "@the-coin/types";
import { DoActionAndNotify } from "../utils/DoActionAndNotify";

/**
 * Bill Payment
 * Called by the client to pay a bill with coin via a certified transfer
 *
 * request CertifiedTransfer Must contain a transfer to this brokers address, and an encrypted BillPayeePacket
 * returns CertifiedTransferResponse
 **/
export function billPayment(request: CertifiedTransfer) {
  return DoActionAndNotify(request, ProcessBillPayment);
}

