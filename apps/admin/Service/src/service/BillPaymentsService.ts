import { success, failure } from "../exchange/VerifiedTransfer";
import { ProcessBillPayment } from '../exchange/VerifiedBillPayments';
import { BrokerCAD } from "@the-coin/types";

/**
 * Trigger a Bill Payment
 * Called by the client to pay a bill in CAD with coin via a certified transfer
 *
 * request CertifiedBillPayment Signed certified transfer to this brokers address
 * user String User address
 * returns CertifiedTransferResponse
 **/
export async function certifiedBillPayment(request: BrokerCAD.CertifiedBillPayment, user: string) {

  console.log("Bill payment from " + user);
  try {
    const results = await ProcessBillPayment(request);
    return success(results.hash);
  }
  catch (e) {
    console.error(JSON.stringify(e));
    return failure(e.message)
  }
}

