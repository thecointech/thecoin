'use strict';

const TapCapStatus = require('../tapcap/TapCapStatus').TapCapStatus;

/**
 * TapCap history
 * User TapCap history in the ranges provided
 *
 * request MessageSigned Purchase Request info
 * returns TapCapHistoryResponse
 **/
exports.tapCapHistory = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "history" : [ {
    "coinAmount" : 1.46581298050294517310021547018550336360931396484375,
    "merchantId" : "merchantId",
    "fiatAmount" : 6.027456183070403,
    "coinBalance" : 5.962133916683182377482808078639209270477294921875,
    "timestamp" : 0.80082819046101150206595775671303272247314453125
  }, {
    "coinAmount" : 1.46581298050294517310021547018550336360931396484375,
    "merchantId" : "merchantId",
    "fiatAmount" : 6.027456183070403,
    "coinBalance" : 5.962133916683182377482808078639209270477294921875,
    "timestamp" : 0.80082819046101150206595775671303272247314453125
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
 * request MessageSigned TapCap status request
 * returns TapCapQueryResponse
 **/
exports.tapCapStatus = function(request) {
  return TapCapStatus(request);
}

