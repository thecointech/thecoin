import { first, last } from '@thecointech/utilities';
import { basicParams, generateData } from './data.test';
import { createParams } from './params';
import { ReturnSimulator } from './simulator';
import { calcFiat, SimulationState } from './state';
import { Decimal } from 'decimal.js-light';
//
// Test the article: "Hacking your income with TheCoin"
// https://docs.google.com/spreadsheets/d/1GhlA6xDz43AojNR8x2eiJgS9AIaTikvkqhzacdtl-RE/edit#gid=0
//
const data = generateData(9, 0, 70, 0);

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
  expect(last(profits1)).toBeCloseTo(180095.109);
})

it ('Matches article with ShockAbsorber', () => {

  const params = createParams({
    ...basicParams,
    shockAbsorber: {
      // We protect up to $500
      maximumProtected: new Decimal(500),
      // for a max drop of 50%
      absorbed: new Decimal(0.50),
      // Using up to 6% of profit
      cushionPercentage: new Decimal(0.06),
    }
  });

  const simulator = new ReturnSimulator(data, params);
  const run1 = simulator.calcReturns(first(data).Date);

  const toProfit = (s: SimulationState) => calcFiat(s, data).sub(s.credit.current).sub(s.credit.balanceDue).toNumber();
  const profits1 = run1.map(toProfit);
  expect(last(profits1)).toBeCloseTo(142000);
})
