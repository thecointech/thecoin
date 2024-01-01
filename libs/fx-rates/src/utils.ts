import type { CurrencyCode, FXRate } from '@thecointech/pricing';

// file deepcode ignore ComparisonObjectExpression: <Ignore complaints about comparison vs EmptyRate>
// TODO: This is a terrible idea!  Return undefined if it's not found!
export const EmptyRate: FXRate = {
  target: 0 as CurrencyCode,
  buy: 0,
  sell: 0,
  fxRate: 0,
  validFrom: 0,
  validTill: 0,
};

export const validFor = (rate: Pick<FXRate, "validFrom"|"validTill">, ts: number) =>
  rate.validFrom <= ts && rate.validTill > ts;

// Always returns an object
export function getFxRate(rates: FXRate[], ts: number): FXRate {
  if (ts == 0 && rates.length > 0)
  {
    return rates.slice(-1)[0];
  }
  return rates.find(rate => validFor(rate, ts)) || EmptyRate;
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
