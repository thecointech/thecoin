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

module.exports.googleList = function googleList (req, res, next) {
  var token = req.swagger.params['token'].value;
  Secure.googleList(token)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.googlePut = function googlePut (req, res, next) {
  var uploadPacket = req.swagger.params['uploadPacket'].value;
  Secure.googlePut(uploadPacket)
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
