'use strict';

var utils = require('../utils/writer.js');
var Secure = require('../service/SecureService');

module.exports.googleStore = function googleStore (req, res, next) {
  var account = req.swagger.params['account'].value;
  Secure.googleStore(account)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
