'use strict';

var utils = require('../utils/writer.js');
var Referrers = require('../service/ReferrersService');

module.exports.referralCreate = function referralCreate (req, res, next) {
  var referral = req.swagger.params['referral'].value;
  Referrers.referralCreate(referral)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.referrerValid = function referrerValid (req, res, next) {
  var referrer = req.swagger.params['referrer'].value;
  Referrers.referrerValid(referrer)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
