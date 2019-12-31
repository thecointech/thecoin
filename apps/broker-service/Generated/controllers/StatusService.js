'use strict';


/**
 * Gets the operating status of the broker
 * Returns info like brokers address, available balance, etc (?)
 *
 * returns BrokerStatus
 **/
exports.status = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "address" : "address",
  "certifiedFee" : 0
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

