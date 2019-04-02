'use strict';
const Referrers = require('../exchange/Referrers')

/**
 * Register the referral of new account
 * Returns a boolean indicating whether the passed referrer is valid
 *
 * referral NewAccountReferal Set referal for new account
 * no response value expected for this operation
 **/
exports.referralCreate = function(referral) {
  return new Promise(async function(resolve, reject) {
    const success = await Referrers.Create(referral);
    if (success)
      resolve();
    else
      reject();
  });
}


/**
 * Gets the validity of the passed referrer
 * Returns a boolean indicating whether the passed referrer is valid
 *
 * referrer String Referrers ID.  This ID must have been previously registered with the system
 * returns Boolean
 **/
exports.referrerValid = function(referrer) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = true;
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

