'use strict';


/**
 * Broker: Notify of an incomplete or failed transaction
 *
 * request TapCapUnCompleted TapCap exchange request
 * returns ErrorMessage
 **/
exports.deleteBroker = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "code" : 0,
  "id" : "id",
  "message" : "message"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Broker: Register new TapCap transaction
 *
 * request SignedMessage TapCap exchange request
 * returns ErrorMessage
 **/
exports.tapCapBroker = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "code" : 0,
  "id" : "id",
  "message" : "message"
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
 * returns TapCapQueryResponse
 **/
exports.tapCapClient = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "balance" : 0,
  "token" : {
    "signature" : "signature",
    "message" : "message"
  }
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

