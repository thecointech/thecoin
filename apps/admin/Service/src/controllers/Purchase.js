'use strict';

var utils = require('../utils/writer.js');
var Purchase = require('../service/PurchaseService');

module.exports.completeCoinPurchase = function completeCoinPurchase (req, res, next) {
  var user = req.swagger.params['user'].value;
  var id = req.swagger.params['id'].value;
  var request = req.swagger.params['request'].value;
  Purchase.completeCoinPurchase(user,id,request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.confirmCoinPurchase = function confirmCoinPurchase (req, res, next) {
  var user = req.swagger.params['user'].value;
  var id = req.swagger.params['id'].value;
  var request = req.swagger.params['request'].value;
  Purchase.confirmCoinPurchase(user,id,request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.queryCoinPurchase = function queryCoinPurchase (req, res, next) {
  var user = req.swagger.params['user'].value;
  var id = req.swagger.params['id'].value;
  var state = req.swagger.params['state'].value;
  Purchase.queryCoinPurchase(user,id,state)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.queryCoinPurchasesIds = function queryCoinPurchasesIds (req, res, next) {
  var state = req.swagger.params['state'].value;
  Purchase.queryCoinPurchasesIds(state)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.requestCoinPurchase = function requestCoinPurchase (req, res, next) {
  var request = req.swagger.params['request'].value;
  Purchase.requestCoinPurchase(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
