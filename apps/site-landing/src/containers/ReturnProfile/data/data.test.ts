import { range } from 'lodash';
import { DateTime } from 'luxon';
import { MarketData } from './market';
import { MergeSimParamaters } from './params';

export function generateData(CAGR = 10, yearsToSimulate = 10, noise = 0.1): MarketData[] {
  const monthStart = DateTime.now().set({
    day: 1,
    hour: 0,
    second: 0,
    millisecond: 0,
  })
  const totalMonths = yearsToSimulate * 12;
  const startingVal = 100;
  const finalVal = startingVal * Math.pow(1 + CAGR / 100, yearsToSimulate);
  const CMGR = Math.pow(finalVal / startingVal, 1 / totalMonths);
  return range(0, totalMonths).map(idx => {
    let value = startingVal * Math.pow(CMGR, idx);
    // Add some random noise
    value = value * (Math.random() * noise + (1 - (noise / 2)));
    value = Math.round(value * 100) / 100;
    const Date = monthStart.minus({ month: totalMonths - idx })
    let dividend = (value * 0.02) * (12 * Date.daysInMonth / Date.daysInYear);
    dividend = Math.round(dividend * 10000) / 10000;
    return {
      Date,
      P: value,
      E: 0,
      D: dividend
    }
  })
}

export const basicParams: MergeSimParamaters = {
  maxOffsetPercentage: 0.02,
  credit: {
    weekly: 100,
    cashBackRate: 0.01,
  },
  income: {
    weekly: 100,
  }
};
