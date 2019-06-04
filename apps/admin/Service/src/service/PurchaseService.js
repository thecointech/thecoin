'use strict';

const BrokerActions = require('../exchange/VerifiedSale')
const ClientActions = require('../exchange/Client')

/**
 * Mark buy order complete
 * Called by the broker to confirm CAD was deposited and coin disbursed
 *
 * user String User address
 * id Integer Id of purchase order to complete
 * request SignedMessage Signed PurchaseComplete
 * returns PurchaseResponse
 **/
exports.completeCoinPurchase = function (user, id, request) {
  return new Promise(function (resolve, reject) {
    BrokerActions.CompletePurchaseOrder(user, id, request)
      .then((results) => {
        resolve(results);
      })
      .catch((err) => {
        // TODO
        console.error(err);
        reject(err);
      })
  });
}


/**
 * Confirm order opened
 * Called by the Broker once e-transfer initiated
 *
 * user String User address
 * id Integer Id of purchase order to return
 * request SignedPurchaseConfirm Signed buy order confirm
 * returns PurchaseResponse
 **/
exports.confirmCoinPurchase = function (user, id, request) {
  return new Promise(function (resolve, reject) {
    BrokerActions.ConfirmPurchaseOrder(user, id, request)
      .then((results) => {
        resolve(results);
      })
      .catch((err) => {
        // TODO
        console.error(err);
        reject(err);
      })
  });
}


/**
 * Query open buy orders
 * Called by the broker to retrieve all open buy orders.
 *
 * user String User address
 * id Integer Id of purchase order to return
 * state String Numerical state identifier.  If not present, all states will be returned (optional)
 * returns PurchaseState
 **/
exports.queryCoinPurchase = function (user, id, state) {
  return new Promise(function (resolve, reject) {
    BrokerActions.QueryPurchaseState(user, id, state)
      .then((state) => {
        resolve(state);
      })
      .catch((error) => {
        console.error(err);
        reject(error);
      });
  });
}


/**
 * Query buy order id's
 * Called by the broker to retrieve all buy orders ID's in the passed state.
 *
 * state BigDecimal Numerical state identifier.  Returned array will be all of type state
 * returns PurchaseIds
 **/
exports.queryCoinPurchasesIds = function (state) {
  return new Promise(function (resolve, reject) {
    BrokerActions.QueryPurchasesIds(state)
      .then((results) => {
        console.log('Queried ids: ' + results);
        resolve(results);
      })
      .catch((err) => {
        // TODO
        console.error(err);
        reject(err);
      })
  });
}


/**
 * Request to buy Coin
 * Called by the client to exchange CAD for coin
 *
 * request SignedPurchaseRequest Signed buy order request
 * returns PurchaseResponse
 **/
exports.requestCoinPurchase = function (request) {
  return new Promise(function (resolve, reject) {
    ClientActions.InitiatePurchase(request)
      .then((orderId) => {
        resolve({
          orderId: orderId
        });
      })
      .catch((err) => {
        console.error(err);
        reject({
          Error: "Transaction not accepted, please contact support"
        })
      })
  })
}

