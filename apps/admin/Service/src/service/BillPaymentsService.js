'use strict';


/**
 * Trigger a Bill Payment
 * Called by the client to pay a bill in CAD with coin via a certified transfer
 *
 * request CertifiedBillPayment Signed certified transfer to this brokers address
 * user String User address
 * returns CertifiedTransferResponse
 **/
exports.certifiedBillPayment = function(request,user) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "message" : "message",
  "txHash" : "txHash"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

