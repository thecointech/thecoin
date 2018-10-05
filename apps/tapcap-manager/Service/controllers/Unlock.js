'use strict';

var utils = require('../utils/writer.js');
var Unlock = require('../service/UnlockService');

module.exports.unlock = function unlock (req, res, next) {
  var xRequestKey = req.swagger.params['X-Request-Key'].value;
  Unlock.unlock(xRequestKey)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
