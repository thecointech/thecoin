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
    let coinWait = RatesDB.GetRatesFor('Coin', timestamp);
    let fxWait = RatesDB.GetRatesFor(currencyCode, timestamp);
    Promise.all([coinWait, fxWait])
    .then((coinRates, fxRates) => {
      let result = {
        "Buy": coinRates.Buy,
        "Sell": coinRates.Sell,
        "FxRate": fxRates.Exchange,
        "ValidTill": coinRates.ValidUntil,
        "ValidFrom": coinRates.ValidFrom,
        "target": currencyCode
      };
      resolve(result);
    })
    .except((error) => {
      reject('Error in fetch');
    });
  });
}