'use strict';


/**
 * Register the referral of new account
 * Returns a boolean indicating whether the passed referrer is valid
 *
 * referral NewAccountReferal Set referal for new account
 * returns BoolResponse
 **/
exports.referralCreate = function(referral) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "success" : true
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
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
exports.referrerValid = function(referrer) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "success" : true
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

