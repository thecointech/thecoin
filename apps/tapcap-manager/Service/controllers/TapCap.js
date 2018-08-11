'use strict';

var utils = require('../utils/writer.js');
var TapCap = require('../service/TapCapService');

module.exports.tapCapHistory = function tapCapHistory (req, res, next) {
  var request = req.swagger.params['request'].value;
  TapCap.tapCapHistory(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.tapCapStatus = function tapCapStatus (req, res, next) {
  var request = req.swagger.params['request'].value;
  TapCap.tapCapStatus(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
