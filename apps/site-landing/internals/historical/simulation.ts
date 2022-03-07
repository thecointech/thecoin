import { range } from 'lodash';
import { DateTime } from 'luxon';
import { MarketData } from '../../src/containers/BenefitsSimulator/simulator/market';
import { MergeSimParamaters } from '../../src/containers/BenefitsSimulator/simulator/params';
import { Decimal } from 'decimal.js-light';

export function generateData(CAGR = 10, LGR=0, yearsToSimulate = 10, noise = 0.1): MarketData[] {
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
  const LMGR = LGR / 12;
  return range(0, totalMonths).map(idx => {
    let value = startingVal * Math.pow(CMGR, idx) + startingVal * LMGR * idx;
    // Add some random noise
    value = value * (Math.random() * noise + (1 - (noise / 2)));
    value = Math.round(value * 100) / 100;
    const Date = monthStart.minus({ month: totalMonths - idx })
    let dividend = (value * 0.02) * (12 * Date.daysInMonth / Date.daysInYear);
    dividend = Math.round(dividend * 10000) / 10000;
    return {
      Date,
      P: new Decimal(value),
      E: new Decimal(0),
      D: new Decimal(dividend),
      Fx: new Decimal(1),
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
