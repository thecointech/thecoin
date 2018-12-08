'use strict';

const TapTxBroker = require('../tapcap/TapTxBroker').TapTxBroker;
const TapTxClient = require('../tapcap/TapTxClient').TapTxClient;

const DeleteTxBroker = require('../tapcap/DeleteTxBroker').DeleteTx;

/**
 * Broker: Notify of an incomplete or failed transaction
 *
 * request SignedMessage TapCap exchange request
 * returns ErrorMessage
 **/
exports.deleteBroker = function(request) {
  return new Promise(function (resolve, reject) {
    DeleteTxBroker(request)
      .then((result) => {
        resolve({
          code: 0,
          id: 0,
          message: "Tx Succesfully deleted"
        });
      })
      .catch((err) => {
        console.error(err);
        reject('{"error": "No idea what happens now!"}');
      });
  });
}


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

