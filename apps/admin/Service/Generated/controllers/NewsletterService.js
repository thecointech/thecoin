'use strict';


/**
 * Confirm email subscription.
 *
 * details SubscriptionDetails 
 * returns BoolResponse
 **/
exports.newsletterConfirm = function(details) {
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
 * Register an email address for our newsletter.
 *
 * details SubscriptionDetails 
 * returns BoolResponse
 **/
exports.newsletterSignup = function(details) {
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
 * Unsubscribe an email address from our newsletter.
 *
 * email String 
 * returns BoolResponse
 **/
exports.newsletterUnsubscribe = function(email) {
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

