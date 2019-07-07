'use strict';

var utils = require('../utils/writer.js');
var Buy = require('../service/BuyService');

module.exports.eTransferCode = function eTransferCode (req, res, next) {
  var request = req.swagger.params['request'].value;
  Buy.eTransferCode(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
