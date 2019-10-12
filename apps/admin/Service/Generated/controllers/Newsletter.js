'use strict';

var utils = require('../utils/writer.js');
var Newsletter = require('../service/NewsletterService');

module.exports.newsletterConfirm = function newsletterConfirm (req, res, next) {
  var details = req.swagger.params['details'].value;
  Newsletter.newsletterConfirm(details)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.newsletterDetails = function newsletterDetails (req, res, next) {
  var id = req.swagger.params['id'].value;
  Newsletter.newsletterDetails(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.newsletterSignup = function newsletterSignup (req, res, next) {
  var details = req.swagger.params['details'].value;
  Newsletter.newsletterSignup(details)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.newsletterUnsubscribe = function newsletterUnsubscribe (req, res, next) {
  var id = req.swagger.params['id'].value;
  Newsletter.newsletterUnsubscribe(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
