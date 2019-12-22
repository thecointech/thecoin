'use strict';


/**
 * Bill Payment
 * Called by the client to pay a bill with coin via a certified transfer
 *
 * request CertifiedTransfer Must contain a transfer to this brokers address, and an encrypted BillPayeePacket
 * returns CertifiedTransferResponse
 **/
exports.billPayment = function(request) {
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

