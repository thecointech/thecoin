'use strict';


/**
 * Get the authorization URL to redirect the user to
 *
 * returns String
 **/
exports.googleAuthUrl = function() {
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
 * Get the listing of available accounts
 *
 * token GoogleToken 
 * returns GoogleListResult
 **/
exports.googleList = function(token) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "accounts" : [ "accounts", "accounts" ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Store on google drive
 *
 * uploadPacket GooglePutRequest 
 * no response value expected for this operation
 **/
exports.googlePut = function(uploadPacket) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Retrieve previously-stored file from google drive
 *
 * token GoogleGetRequest 
 * returns GoogleGetResult
 **/
exports.googleRetrieve = function(token) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "wallet" : "wallet"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

