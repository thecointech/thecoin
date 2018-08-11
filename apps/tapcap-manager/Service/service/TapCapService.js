'use strict';


/**
 * TapCap current status
 * User TapCap status
 *
 * request TapCapHistoryRequestSigned Purchase Request info
 * returns TapCapHistoryResponseSigned
 **/
exports.tapCapHistory = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "signature" : "signature",
  "response" : {
    "history" : [ {
      "coinAmount" : 1.46581298050294517310021547018550336360931396484375,
      "merchantId" : "merchantId",
      "fiatAmount" : 6.027456183070403,
      "timestamp" : 0.80082819046101150206595775671303272247314453125
    }, {
      "coinAmount" : 1.46581298050294517310021547018550336360931396484375,
      "merchantId" : "merchantId",
      "fiatAmount" : 6.027456183070403,
      "timestamp" : 0.80082819046101150206595775671303272247314453125
    } ]
  }
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
 * request TapCapQueryRequestSigned TapCap status request
 * returns TapCapQueryResponseSigned
 **/
exports.tapCapStatus = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "signature" : "signature",
  "response" : {
    "balance" : 0.80082819046101150206595775671303272247314453125,
    "weeklyTopup" : 6.02745618307040320615897144307382404804229736328125
  }
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

