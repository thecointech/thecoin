'use strict';

var utils = require('../utils/writer.js');
var Transactions = require('../service/TransactionsService');

module.exports.tapCapBroker = function tapCapBroker (req, res, next) {
  var request = req.swagger.params['request'].value;
  Transactions.tapCapBroker(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.tapCapClient = function tapCapClient (req, res, next) {
  var request = req.swagger.params['request'].value;
  Transactions.tapCapClient(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
