'use strict';

var utils = require('../utils/writer.js');
var Secure = require('../service/SecureService');

module.exports.googleAuthUrl = function googleAuthUrl (req, res, next) {
  Secure.googleAuthUrl()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.googleRetrieve = function googleRetrieve (req, res, next) {
  var token = req.swagger.params['token'].value;
  Secure.googleRetrieve(token)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

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
