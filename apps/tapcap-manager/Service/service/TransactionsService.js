'use strict';


/**
 * Broker: Register new TapCap transaction
 *
 * request TapCapPurchaseBrokerSigned TapCap exchange request
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
 * request TapCapTokenSigned TapCap status request
 * returns TapCapPurchaseFinalSigned
 **/
exports.tapCapClient = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "request" : {
    "request" : {
      "request" : {
        "request" : {
          "fiat" : 0.80082819046101150206595775671303272247314453125,
          "currencyCode" : 6.02745618307040320615897144307382404804229736328125,
          "timestamp" : 1.46581298050294517310021547018550336360931396484375,
          "token" : {
            "signature" : "signature",
            "token" : {
              "clientAccount" : "clientAccount",
              "transactionId" : 5.63737665663332876420099637471139430999755859375,
              "availableBalance" : 5.962133916683182377482808078639209270477294921875,
              "timestamp" : 2.3021358869347654518833223846741020679473876953125
            }
          }
        },
        "signature" : "signature"
      },
      "cert" : "cert",
      "coin" : 7.061401241503109105224211816675961017608642578125
    },
    "signature" : "signature"
  },
  "signature" : "signature"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

