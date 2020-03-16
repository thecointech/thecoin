import { GetRatesFor } from '../update/UpdateDb';
/**
 * Exchange Rate
 * Query exchange rate for THE into the given currency
 *
 * currencyCode Integer The integer code for the countries currency
 * timestamp Integer The timestamp we are requesting valid values for
 * returns FXRate
 **/

export function getConversion(currencyCode: any, timestamp: number) {
  return new Promise(function (resolve, reject) {
    const ts = timestamp || Date.now();
    let coinWait = <any> GetRatesFor(0, ts);
    let fxWait = <any> GetRatesFor(currencyCode, ts);
    Promise.all([coinWait, fxWait])
      .then(([coinRates, fxRates]) => {
        let result = {
          "buy": coinRates.Buy,
          "sell": coinRates.Sell,
          "fxRate": fxRates.Rate,
          "validTill": coinRates.ValidUntil,
          "validFrom": coinRates.ValidFrom,
          "target": currencyCode
        };
        resolve(result);
      })
      .catch((error) => {
        console.error(error);
        reject('{ "Error": "Error in fetch" }');
      });
  });
}