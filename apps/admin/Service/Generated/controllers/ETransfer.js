'use strict';

var utils = require('../utils/writer.js');
var ETransfer = require('../service/ETransferService');

module.exports.eTransfer = function eTransfer (req, res, next) {
  var request = req.swagger.params['request'].value;
  ETransfer.eTransfer(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.eTransferInCode = function eTransferInCode (req, res, next) {
  var request = req.swagger.params['request'].value;
  ETransfer.eTransferInCode(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
