'use strict';


/**
 * Mark buy order complete
 * Called by the broker to confirm CAD was deposited and coin disbursed
 *
 * user String User address
 * id Integer Id of purchase order to complete
 * request SignedMessage Signed PurchaseComplete
 * returns PurchaseResponse
 **/
exports.completeCoinPurchase = function(user,id,request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "orderId" : "orderId"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Confirm order opened
 * Called by the Broker once e-transfer initiated
 *
 * user String User address
 * id Integer Id of purchase order to return
 * request SignedPurchaseConfirm Signed buy order confirm
 * returns PurchaseResponse
 **/
exports.confirmCoinPurchase = function(user,id,request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "orderId" : "orderId"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Query open buy orders
 * Called by the broker to retrieve all open buy orders.
 *
 * user String User address
 * id Integer Id of purchase order to return
 * state String Numerical state identifier.  If not present, all states will be returned (optional)
 * returns PurchaseState
 **/
exports.queryCoinPurchase = function(user,id,state) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "confirm" : {
    "signature" : "signature",
    "timestamp" : 0
  },
  "request" : {
    "signature" : "signature",
    "cadAmount" : 6.02745618307040320615897144307382404804229736328125,
    "email" : "email",
    "timestamp" : 0
  },
  "complete" : {
    "cadRate" : 5.63737665663332876420099637471139430999755859375,
    "coinAmount" : 1,
    "coinRate" : 5.962133916683182377482808078639209270477294921875,
    "cadAmount" : 6.02745618307040320615897144307382404804229736328125,
    "txHash" : "txHash",
    "timestamp" : 0
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
 * Query buy order id's
 * Called by the broker to retrieve all buy orders ID's in the passed state.
 *
 * state BigDecimal Numerical state identifier.  Returned array will be all of type state
 * returns PurchaseIds
 **/
exports.queryCoinPurchasesIds = function(state) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = "";
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Request to buy Coin
 * Called by the client to exchange CAD for coin
 *
 * request SignedPurchaseRequest Signed buy order request
 * returns PurchaseResponse
 **/
exports.requestCoinPurchase = function(request) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "orderId" : "orderId"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

