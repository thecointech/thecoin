'use strict';


/**
 * Request coin sale
 * Called by the client to exchange coin for CAD using a certified transfer
 *
 * request CertifiedSale Signed certified transfer to this brokers address
 * returns CertifiedTransferResponse
 **/
exports.certifiedCoinSale = function(request) {
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


/**
 * Request coin sale
 * Called by the client to exchange coin for CAD
 *
 * request SignedMessage Signed sell order request
 * returns SellResponse
 **/
exports.requestCoinSale = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "orderId" : "orderId"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

