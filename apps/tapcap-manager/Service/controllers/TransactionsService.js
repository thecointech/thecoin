'use strict';


/**
 * Broker: Register new TapCap transaction
 *
 * request MessageSigned TapCap exchange request
 * returns inline_response_200
 **/
exports.tapCapBroker = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "errorCode" : 0
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
 * request MessageSigned TapCap status request
 * returns MessageSigned
 **/
exports.tapCapClient = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "signature" : "signature"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

