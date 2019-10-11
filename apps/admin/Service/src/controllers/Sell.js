'use strict';

var utils = require('../utils/writer.js');
var Sell = require('../service/SellService');

module.exports.certifiedCoinSale = function certifiedCoinSale (req, res, next) {
  var request = req.swagger.params['request'].value;
  Sell.certifiedCoinSale(request)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

// module.exports.requestCoinSale = function requestCoinSale (req, res, next) {
//   var request = req.swagger.params['request'].value;
//   Sell.requestCoinSale(request)
//     .then(function (response) {
//       utils.writeJson(res, response);
//     })
//     .catch(function (response) {
//       utils.writeJson(res, response);
//     });
// };
