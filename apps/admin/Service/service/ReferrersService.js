'use strict';
const Referrers = require('../exchange/Referrers')

/**
 * Register the referral of new account
 * Returns a boolean indicating whether the passed referrer is valid
 *
 * referral NewAccountReferal Set referal for new account
 * returns BoolResponse
 **/
exports.referralCreate = function(referral) {
  return new Promise(async function(resolve, reject) {
    try {
      const created = await Referrers.Create(referral);
      resolve({
        success: created
      });
    } catch(err) {
      console.error(err);
      reject('Server Error');
    }
  });
}


/**
 * Gets the validity of the passed referrer
 * Returns a boolean indicating whether the passed referrer is valid
 *
 * referrer String Referrers ID.  This ID must have been previously registered with the system
 * returns BoolResponse
 **/
exports.referrerValid = function(referrerId) {
  return new Promise(async function(resolve, reject) {
    try {
      const address = await Referrers.GetReferrerAddress(referrerId);
      resolve({
        success: !!address
      });
    }
    catch(err) {
      console.error(err);
      reject('Server Error');
    }
  });
}

