'use strict';


/**
 * Coin e-Transfer secret answer
 * A unique code for the requesting user to use as an answer to their e-Transfer question
 *
 * request SignedMessage Signed certified transfer to this brokers address
 * returns eTransferCodeResponse
 **/
exports.eTransferCode = function(request) {
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

