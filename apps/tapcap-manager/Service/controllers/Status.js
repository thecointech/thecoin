'use strict';

var utils = require('../utils/writer.js');
var Status = require('../service/StatusService');

module.exports.tapCapHistory = function tapCapHistory (req, res, next) {
  var request = req.swagger.params['request'].value;
  Status.tapCapHistory(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.tapCapStatus = function tapCapStatus (req, res, next) {
  var request = req.swagger.params['request'].value;
  Status.tapCapStatus(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
