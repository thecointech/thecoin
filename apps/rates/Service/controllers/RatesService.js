'use strict';


/**
 * Exchange Rate
 * Query exchange rate for THE into the given currency
 *
 * currencyCode Integer The integer code for the countries currency
 * timestamp Long The timestamp we are requesting valid values for
 * returns FXRate
 **/
exports.getConversion = function(currencyCode,timestamp) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "fxRate" : 5.962133916683182,
  "validTill" : 2,
  "buy" : 6.027456183070403,
  "sell" : 1.4658129805029452,
  "validFrom" : 5,
  "target" : 0
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

