'use strict';


/**
 * Broker: Register new TapCap transaction
 *
 * request SignedMessage TapCap exchange request
 * returns inline_response_200
 **/
exports.tapCapBroker = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "errorCode" : 0.80082819046101150206595775671303272247314453125
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
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

