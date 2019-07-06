'use strict';


/**
 * Get the authorization URL to redirect the user to
 *
 * returns GoogleAuthUrl
 **/
exports.googleAuthUrl = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "url" : "url"
};
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
  "wallets" : [ {
    "name" : "name",
    "id" : "id",
    "type" : "type"
  }, {
    "name" : "name",
    "id" : "id",
    "type" : "type"
  } ]
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
 * token GoogleToken 
 * returns GoogleGetResult
 **/
exports.googleRetrieve = function(token) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "wallets" : [ {
    "wallet" : "wallet",
    "id" : {
      "name" : "name",
      "id" : "id",
      "type" : "type"
    }
  }, {
    "wallet" : "wallet",
    "id" : {
      "name" : "name",
      "id" : "id",
      "type" : "type"
    }
  } ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

