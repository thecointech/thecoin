import { getLatestCombinedRates, getCombinedRates } from '../rates';
/**
 * Exchange Rate
 * Query exchange rate for THE into the given currency
 *
 * currencyCode Integer The integer code for the countries currency
 * timestamp Integer The timestamp we are requesting valid values for
 * returns FXRate
 **/
export async function getConversion(_currencyCode: number, timestamp?: number) {

  const ts = Math.min(Date.now(), timestamp ?? Number.MAX_SAFE_INTEGER);
  let res = getCombinedRates(ts);
  if (res)
    return res;

  console.error('No Rates found at {Timestamp}', ts);
  return getLatestCombinedRates();
}
