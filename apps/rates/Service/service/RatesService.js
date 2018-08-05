'use strict';

const RatesDB = require('../update/UpdateDb');
/**
 * Exchange Rate
 * Query exchange rate for THE into the given currency
 *
 * currencyCode Integer The integer code for the countries currency
 * timestamp Integer The timestamp we are requesting valid values for
 * returns FXRate
 **/
exports.getConversion = function (currencyCode, timestamp) {
  return new Promise(function (resolve, reject) {
    RatesDB.GetCoinRatesFor(timestamp)
    .then((coinRates) => {
      let result = {
        "CoinRate": coinRates.Buy,
        "FxRate": 1.4658129805029452,
        "ValidTill": coinRates.ValidUntil,
        "ValidFrom": coinRates.ValidFrom,
        "target": currencyCode
      };
      resolve(result);
    });
  });
}