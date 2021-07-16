import type { FXRate } from '@thecointech/pricing';

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
