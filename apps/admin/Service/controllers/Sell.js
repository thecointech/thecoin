'use strict';

var utils = require('../utils/writer.js');
var Sell = require('../service/SellService');

module.exports.certifiedCoinSale = function certifiedCoinSale (req, res, next) {
  var request = req.swagger.params['request'].value;
  Sell.certifiedCoinSale(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.completeCoinSale = function completeCoinSale (req, res, next) {
  var user = req.swagger.params['user'].value;
  var id = req.swagger.params['id'].value;
  var request = req.swagger.params['request'].value;
  Sell.completeCoinSale(user,id,request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.requestCoinSale = function requestCoinSale (req, res, next) {
  var request = req.swagger.params['request'].value;
  Sell.requestCoinSale(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
