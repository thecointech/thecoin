'use strict';

const TapCapBroker = require('../tapcap/TapCapBroker').TapCapBroker;
/**
 * Broker: Register new TapCap transaction
 *
 * request SignedMessage TapCap exchange request
 * returns inline_response_200
 **/
exports.tapCapBroker = function(request) {
  return new Promise(function (resolve, reject) {
    TapCapBroker(request)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.error(err);
        reject('{"error": "Tx Not Registered!"}');
      });
  });
}


/**
 * Client: Confirm new TapCap transaction
 *
 * request SignedMessage TapCap status request
 * returns SignedMessage
 **/
exports.tapCapClient = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "signature" : "signature",
  "message" : "message"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

