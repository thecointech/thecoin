'use strict';


/**
 * Request Transfer from->to
 * A client may request that the Broker initiate a transfer from their account to another.  The transfer includes a fee paid to the broker to cover the cost of the transfer.  This allows a user to operate on the Ethereum blockchain without requiring their own ether
 *
 * request CertifiedTransferRequest A request appropriately filled out and signed as described in the comments
 * returns CertifiedTransferResponse
 **/
exports.makeCertifiedTransfer = function(request) {
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

