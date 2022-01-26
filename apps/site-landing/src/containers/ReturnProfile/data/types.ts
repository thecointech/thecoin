import { DateTime } from 'luxon';

// US abandoned gold standard in April 1933
export const FDRNewDeal = DateTime.fromObject({year: 1933, month: 3});

export interface DataFormat {
  Date: DateTime;
  P: number;
  D: number;
  E: number;
}


export type CoinReturns = {
  lowerBound: number;
  upperBound: number;
  mean: number;
  median: number;
  values: number[];
}
