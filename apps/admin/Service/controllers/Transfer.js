'use strict';

var utils = require('../utils/writer.js');
var Transfer = require('../service/TransferService');

module.exports.makeCertifiedTransfer = function makeCertifiedTransfer (req, res, next) {
  var request = req.swagger.params['request'].value;
  Transfer.makeCertifiedTransfer(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
