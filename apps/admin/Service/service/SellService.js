'use strict';


/**
 * Mark coin sale complete
 * Called by the client to exchange coin for CAD
 *
 * user String User address
 * id Integer Id of purchase order to return
 * request SignedMessage Signed sell order request
 * returns SellResponse
 **/
exports.completeCoinSale = function(user,id,request) {
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
 * Request coin sale
 * Called by the client to exchange coin for CAD
 *
 * request SignedMessage Signed sell order request
 * returns SellResponse
 **/
exports.requestCoinSale = function(request) {
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

