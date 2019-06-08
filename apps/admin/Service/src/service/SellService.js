'use strict';

import { SendMail } from '../exchange/AutoMailer';
import { DoCertifiedSale } from '../exchange/VerifiedSale';

/**
 * Request coin sale
 * Called by the client to exchange coin for CAD using a certified transfer
 *
 * request CertifiedSale Signed certified transfer to this brokers address
 * returns SellResponse
 **/
export async function certifiedCoinSale(request) {
  try {
    const results = await DoCertifiedSale(request);
    console.log(`Sale Result: ${JSON.stringify(results)}`);
    SendMail("Certified Coin Sale: ",  JSON.stringify(results) + "\n---\n" + JSON.stringify(request));
    return results;
  }
  catch(err)
  {
    console.error(err);
    SendMail("Certified Coin Sale: ERROR", JSON.stringify(err) + "\n---\n" + JSON.stringify(request));
    throw(err)
  };
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

