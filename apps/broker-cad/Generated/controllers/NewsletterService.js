'use strict';


/**
 * Confirm email subscription.
 *
 * details SubscriptionDetails 
 * returns SubscriptionDetails
 **/
exports.newsletterConfirm = function(details) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "firstName" : "firstName",
  "lastName" : "lastName",
  "country" : "country",
  "city" : "city",
  "id" : "id",
  "confirmed" : true,
  "email" : "email"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Get subscription details.
 *
 * id String 
 * returns SubscriptionDetails
 **/
exports.newsletterDetails = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "firstName" : "firstName",
  "lastName" : "lastName",
  "country" : "country",
  "city" : "city",
  "id" : "id",
  "confirmed" : true,
  "email" : "email"
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
 * id String 
 * returns BoolResponse
 **/
exports.newsletterUnsubscribe = function(id) {
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

