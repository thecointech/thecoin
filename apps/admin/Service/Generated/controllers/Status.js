'use strict';

var utils = require('../utils/writer.js');
var Status = require('../service/StatusService');

module.exports.status = function status (req, res, next) {
  Status.status()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
