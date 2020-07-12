import { FinnhubData, FinnhubRates } from "./types";
import Axios from 'axios';
import { finnhub_key } from './secret.json';

export async function fetchNewCoinRates(resolution: string, from: number, to: number) {
  //log.trace(`Fetching SPX rates from ${new Date(from)} until now`);
  const fromInt = Math.round(from / 1000);
  const toInt = Math.floor(to / 1000);
  const url = `https://finnhub.io/api/v1/stock/candle?symbol=%5EGSPC&resolution=${resolution}&token=${finnhub_key}&from=${fromInt}&to=${toInt}`
  var r = await Axios.get<FinnhubData>(url);
  //log.debug(`Fetched SPX rates: ${r?.statusText} - ${r?.data?.t?.length} results`);
  return r.data
}

export async function fetchNewFxRates() {
  //log.trace("Fetching FX rates");
  var r = await Axios.get<FinnhubRates>(`https://finnhub.io/api/v1/forex/rates?base=USD&token=${finnhub_key}`);
  //log.debug(`Fetched FX rates: ${r?.statusText} - ${r?.data?.base} base`);
  const { data } = r;
  return data
}

// async function fetchLastUpdateTS(): Promise<number> {
//   const k = datastore.key([0, "latest"]);
//   const [data] = await datastore.get(k)
//   return data.ValidUntil;
// }

export * from './types';
