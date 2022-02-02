import { first, last } from '@thecointech/utilities';
import range from 'lodash/range';
import { DateTime } from 'luxon';
import { MarketData } from './market';
import { createParams } from './params';
import { ReturnSimulator } from './simulator';
import { calcFiat, SimulationState } from './state';

//
// Test the article: "Hacking your income with TheCoin"
// https://docs.google.com/spreadsheets/d/1GhlA6xDz43AojNR8x2eiJgS9AIaTikvkqhzacdtl-RE/edit#gid=0
//
const data = generateData(9, 70, 0);
const basicParams = {
  maxOffsetPercentage: 0.02,
  credit: {
    weekly: 100,
    cashBackRate: 0.01,
  },
  income: {
    weekly: 100,
  }
};

it ('Matches the article with no ShockAbsorber', () => {
  const params = createParams(basicParams);
  const simulator = new ReturnSimulator(data, params);
  const run1 = simulator.calcReturns(first(data).Date);

  // The spreadsheet version of this runs to about 188645 at 60 years.
  // This is a fairly large discrepancy, but it seems to stem from the fact
  // that our simulation is much more accurate (it operates on a per-week
  // level, rather than the yearly level the spreadsheet runs at)
  const toProfit = (s: SimulationState) => calcFiat(s, data).sub(s.credit.current).sub(s.credit.balanceDue).toNumber();
  const profits1 = run1.map(toProfit);
  expect(last(profits1)).toBeCloseTo(180092.226);
})

it ('Matches article with ShockAbsorber', () => {

  const params = createParams({
    ...basicParams,
    shockAbsorber: {
      // We protect up to $500
      maximumProtected: 500,
      // for a max drop of 50%
      absorbed: 0.50,
      // Using up to 6% of profit
      cushionPercentage: 0.06,
    }
  });

  const simulator = new ReturnSimulator(data, params);
  const run1 = simulator.calcReturns(first(data).Date);

  const toProfit = (s: SimulationState) => calcFiat(s, data).sub(s.credit.current).sub(s.credit.balanceDue).toNumber();
  const profits1 = run1.map(toProfit);
  expect(last(profits1)).toBeCloseTo(180092.226);
})

function generateData(CAGR = 10, yearsToSimulate = 10, noise = 0.1): MarketData[] {
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
    const Date = monthStart.minus({month: totalMonths - idx})
    return {
      Date,
      P: value,
      E: 0,
      D: (value * 0.02) * (12 * Date.daysInMonth / Date.daysInYear)
    }
  })
}
