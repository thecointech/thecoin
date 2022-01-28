import { DateTime } from 'luxon';
export * from './state';
export * from './params';

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
