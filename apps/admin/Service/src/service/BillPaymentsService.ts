const { ProcessBillPayment } = require('../exchange/VerifiedBillPayments');

/**
 * Trigger a Bill Payment
 * Called by the client to pay a bill in CAD with coin via a certified transfer
 *
 * request CertifiedBillPayment Signed certified transfer to this brokers address
 * user String User address
 * returns CertifiedTransferResponse
 **/
export async function certifiedBillPayment(request,user) {

  console.log("Bill payment from " + user);
  try {
    return await ProcessBillPayment(request)
  }
  catch (e) {
    console.error(JSON.stringify(e));
    return {
      message: e.message,
      txHash: ""
    }
  }
}

