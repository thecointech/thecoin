'use strict';

const TapTxBroker = require('../tapcap/TapTxBroker').TapTxBroker;
const TapTxClient = require('../tapcap/TapTxClient').TapTxClient;
/**
 * Broker: Register new TapCap transaction
 *
 * request SignedMessage TapCap exchange request
 * returns inline_response_200
 **/
exports.tapCapBroker = function(request) {
  return new Promise(function (resolve, reject) {
    TapTxBroker(request)
      .then((result) => {
        resolve({
          code: 0,
          id: 0,
          message: "Tx Succesfully registered"
        });
      })
      .catch((err) => {
        console.error(err);
        reject('{"error": "Tx Not Registered!"}');
      });
  });
}


/**
 * Client: Confirm new TapCap transaction
 *
 * request SignedMessage TapCap status request
 * returns SignedMessage
 **/
exports.tapCapClient = function(request) {
  return new Promise(function (resolve, reject) {
    TapTxClient(request)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.error(err);
        reject('{"error": "Tx Not Registered!"}');
      });
  });
}

