'use strict';

const { SendMail } = require('../exchange/AutoMailer');
const BrokerActions = require('../exchange/Broker')

/**
 * Request coin sale
 * Called by the client to exchange coin for CAD using a certified transfer
 *
 * request CertifiedSale Signed certified transfer to this brokers address
 * returns SellResponse
 **/
exports.certifiedCoinSale = function(request) {
  return new Promise(function (resolve, reject) {
    BrokerActions.DoCertifiedSale(request)
      .then((results) => {
        SendMail("Certified Coin Sale: ",  JSON.stringify(results) + "\n---\n" + JSON.stringify(request));
        console.log('Did Coin Sale' + JSON.stringify(results))
        resolve(results);
      })
      .catch((err) => {
        SendMail("Certified Coin Sale: ERROR", JSON.stringify(results) + "\n---\n" + JSON.stringify(request));
        console.error(err);
        reject(err);
      })
  });
}


// /**
//  * Mark coin sale complete
//  * Called by the client to exchange coin for CAD
//  *
//  * user String User address
//  * id Integer Id of purchase order to return
//  * request SignedMessage Signed sell order request
//  * returns SellResponse
//  **/
// exports.completeCoinSale = function(user,id,request) {
//   return new Promise(function(resolve, reject) {
//     var examples = {};
//     examples['application/json'] = {
//   "orderId" : "orderId"
// };
//     if (Object.keys(examples).length > 0) {
//       resolve(examples[Object.keys(examples)[0]]);
//     } else {
//       resolve();
//     }
//   });
// }


// /**
//  * Request coin sale
//  * Called by the client to exchange coin for CAD
//  *
//  * request SignedMessage Signed sell order request
//  * returns SellResponse
//  **/
// exports.requestCoinSale = function(request) {
//   return new Promise(function(resolve, reject) {
//     var examples = {};
//     examples['application/json'] = {
//   "orderId" : "orderId"
// };
//     if (Object.keys(examples).length > 0) {
//       resolve(examples[Object.keys(examples)[0]]);
//     } else {
//       resolve();
//     }
//   });
// }

