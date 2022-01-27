import { DateTime } from 'luxon';

export type DataFormat = {
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
