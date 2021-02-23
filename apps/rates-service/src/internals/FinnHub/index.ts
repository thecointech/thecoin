import { FinnhubData, FinnhubRates, hasError } from "./types";
import Axios, { AxiosResponse } from 'axios';
import { finnhub_key } from './secret.json';

function throwError(r: AxiosResponse): never {
  throw new Error(`Fetch failed: ${r.statusText} : ${
    hasError(r.data)
      ? r.data.error
      : JSON.stringify(r.data)
  }`);
}

function validate<T>(r: AxiosResponse<T>, testMember: keyof T, testValue: any) {
  if (r.status != 200 ||
      !r.data ||
      r.data[testMember] != testValue
  ) {
    throwError(r);
  }
}

const validateStatus = (status: number) => status < 500;

export async function fetchNewCoinRates(resolution: string, from: number, to: number) {
  const fromInt = Math.round(from / 1000);
  const toInt = Math.floor(to / 1000);
  const url = `https://finnhub.io/api/v1/stock/candle?symbol=%5EGSPC&resolution=${resolution}&token=${finnhub_key}&from=${fromInt}&to=${toInt}`;
  const r = await Axios.get<FinnhubData>(url, {validateStatus});
  validate(r, "s", "ok");
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
