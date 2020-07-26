import { FinnhubData, FinnhubRates, hasError } from "./types";
import Axios, { AxiosResponse } from 'axios';
import { finnhub_key } from './secret.json';

function validate<T>(r: AxiosResponse<T>, testMember: keyof T, testValue: any) {
  if (r.status != 200 ||
      !r.data ||
      r.data[testMember] != testValue
  ) {
    throw new Error(`Fetch failed: ${r.statusText} : ${
      hasError(r.data)
        ? r.data.error
        : r.data[testMember]
    }`);
  }
}

export async function fetchNewCoinRates(resolution: string, from: number, to: number) {
  //log.trace(`Fetching SPX rates from ${new Date(from)} until now`);
  const fromInt = Math.round(from / 1000);
  const toInt = Math.floor(to / 1000);
  const url = `https://finnhub.io/api/v1/stock/candle?symbol=%5EGSPC&resolution=${resolution}&token=${finnhub_key}&from=${fromInt}&to=${toInt}`
  var r = await Axios.get<FinnhubData>(url);
  validate(r, "s", "ok")
  //log.debug(`Fetched SPX rates: ${r?.statusText} - ${r?.data?.t?.length} results`);
  return r.data
}

export async function fetchNewFxRates() {
  //log.trace("Fetching FX rates");
  const url = `https://finnhub.io/api/v1/forex/rates?base=USD&token=${finnhub_key}`;
  var r = await Axios.get<FinnhubRates>(url);
  //log.debug(`Fetched FX rates: ${r?.statusText} - ${r?.data?.base} base`);
  validate(r, "base", "USD");
  return r.data
}

export * from './types';
