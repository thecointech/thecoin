var utils = require('../utils/writer.js');
var Rates = require('../service/RatesService');

export function getConversion(req, res, next) {
  var currencyCode = req.swagger.params['currencyCode'].value;
  var timestamp = req.swagger.params['timestamp'].value;
  Rates.getConversion(currencyCode,timestamp)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};