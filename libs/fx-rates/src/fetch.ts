import { log } from '@thecointech/logging';
import { CurrencyCode } from './CurrencyCodes';
import { FXRate, RatesApi } from '@thecointech/pricing';

// file deepcode ignore ComparisonObjectExpression: <Ignore complaints about comparison vs EmptyRate>
export const EmptyRate: FXRate = {
  target: -1,
  buy: 0,
  sell: 0,
  fxRate: 0,
  validFrom: 0,
  validTill: 0,
};

export const validFor = (rate: FXRate, ts: number) =>
  rate.validFrom <= ts && rate.validTill > ts;

// Always returns an object
export function getFxRate(rates: FXRate[], ts: number): FXRate {
  if (ts == 0 && rates.length > 0)
  {
    return rates.slice(-1)[0];
  }
  return rates.find((rate: FXRate) => validFor(rate, ts)) || EmptyRate;
}

export const getRate = (rates: FXRate[], date?: Date) => getFxRate(rates, date?.getTime() ?? 0);

export function weBuyAt(rates: FXRate[], date?: Date) {
  const { buy, fxRate } = getRate(rates, date);
  return buy * fxRate;
}

export function weSellAt(rates: FXRate[], date?: Date) {
  const { sell, fxRate } = getRate(rates, date);
  return sell * fxRate;
}

export async function fetchRate(date?: Date): Promise<FXRate | null> {
  const cc = CurrencyCode.CAD;
  log.trace(`fetching fx rate: ${cc} for time ${date?.toLocaleTimeString() ?? "now"}`);
  const api = new RatesApi(undefined, process.env.URL_SERVICE_RATES);
  const r = await api.getSingle(cc, date?.getTime() ?? 0);
  if (r.status != 200 || !r.data.validFrom) {
    if (date)
      log.error(`Error fetching rate for: ${date.getTime()} (${date.toLocaleString()}): ${r.statusText} - ${r.data}`)
    else
      log.error(`Error fetching latest rate: ${r.statusText}`);
    return null;
  }
  return r.data;
}
