'use strict';


/**
 * Request eTransfer
 * Called by the client to exchange coin for CAD and send via eTransfer
 *
 * request CertifiedTransfer Must contain a transfer to this brokers address, and an encrypted ETransferPacket
 * returns CertifiedTransferResponse
 **/
exports.eTransfer = function(request) {
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
 * Required answer for eTransfer sent to this broker
 * A code unique to the user that is required on all eTransfers sent in to this broker
 *
 * request SignedMessage Signed timestamp message
 * returns eTransferCodeResponse
 **/
exports.eTransferInCode = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "code" : "code",
  "error" : "error"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

