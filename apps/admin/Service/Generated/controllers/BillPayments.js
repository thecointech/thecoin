'use strict';

var utils = require('../utils/writer.js');
var BillPayments = require('../service/BillPaymentsService');

module.exports.certifiedBillPayment = function certifiedBillPayment (req, res, next) {
  var request = req.swagger.params['request'].value;
  var user = req.swagger.params['user'].value;
  BillPayments.certifiedBillPayment(request,user)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
