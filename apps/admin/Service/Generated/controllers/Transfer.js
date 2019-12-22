'use strict';

var utils = require('../utils/writer.js');
var Transfer = require('../service/TransferService');

module.exports.transfer = function transfer (req, res, next) {
  var request = req.swagger.params['request'].value;
  Transfer.transfer(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
