'use strict';


/**
 * TapCap history
 * User TapCap history in the ranges provided
 *
 * request SignedMessage Purchase Request info
 * returns TapCapHistoryResponse
 **/
exports.tapCapHistory = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "history" : [ {
    "coinAmount" : 1,
    "merchantId" : "merchantId",
    "fiatAmount" : 6.027456183070403,
    "coinBalance" : 5,
    "timestamp" : 0
  }, {
    "coinAmount" : 1,
    "merchantId" : "merchantId",
    "fiatAmount" : 6.027456183070403,
    "coinBalance" : 5,
    "timestamp" : 0
  } ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * TapCap current status
 * User TapCap status
 *
 * request SignedMessage TapCap status request
 * returns TapCapQueryResponse
 **/
exports.tapCapStatus = function(request) {
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

