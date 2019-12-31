'use strict';

var utils = require('../utils/writer.js');
var BillPayments = require('../service/BillPaymentsService');

module.exports.billPayment = function billPayment (req, res, next) {
  var request = req.swagger.params['request'].value;
  BillPayments.billPayment(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
