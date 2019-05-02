'use strict';

const BrokerActions = require('../exchange/Broker')

/**
 * Request Transfer from->to
 * A client may request that the Broker initiate a transfer from their account to another.  The transfer includes a fee paid to the broker to cover the cost of the transfer.  This allows a user to operate on the Ethereum blockchain without requiring their own ether
 *
 * request CertifiedTransferRequest A request appropriately filled out and signed as described in the comments
 * returns CertifiedTransferResponse
 **/
exports.makeCertifiedTransfer = function(request) {
  return new Promise(async function(resolve, reject) {
    var result = await BrokerActions.DoCertifiedTransfer(request);
    if (result.txHash) 
      resolve(result)
    else {
      console.error(JSON.stringify(result));
      reject(result);
    }
  });
}

