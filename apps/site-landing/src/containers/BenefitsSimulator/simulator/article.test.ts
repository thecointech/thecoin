import { basicParams, generateData } from '../../../../internals/historical/simulation';
import { createParams, SimulationParameters } from './params';
import { ReturnSimulator } from './simulator';
import { netFiat } from './state';
import Decimal from 'decimal.js-light';

//
// Test the article: "Hacking your income with TheCoin"
// https://docs.google.com/spreadsheets/d/1GhlA6xDz43AojNR8x2eiJgS9AIaTikvkqhzacdtl-RE/edit#gid=0
const data = generateData(9, 0, 70, 0);

const runSim = (params: SimulationParameters) => {
  const simulator = new ReturnSimulator(data, params);
  const start = data[0].Date;
  const end = start.plus({years: 60});
  const initial = simulator.getInitial(start);
  const final = simulator.calcStateUntil(initial, start, end);
  return netFiat(final);
}

it ('Matches the article with no ShockAbsorber', () => {
  const params = createParams(basicParams);
  const profit = runSim(params);

  // The spreadsheet version of this runs to about 188645 at 60 years.
  // This is a fairly large discrepancy, but it seems to stem from the fact
  // that our simulation is much more accurate (it operates on a per-week
  // level, rather than the yearly level the spreadsheet runs at)
  expect(profit).toBeCloseTo(180391.481);
})

it ('Matches article with ShockAbsorber', () => {

  const params = createParams({
    ...basicParams,
    shockAbsorber: {
      // We protect up to $500
      maximumProtected: new Decimal(500),
      // for a max drop of 50%
      cushionDown: new Decimal(0.50),
      // Using up to 6% of profit
      cushionUp: new Decimal(0.06),
    }
  });

  const profit = runSim(params);
  expect(profit).toBeCloseTo(122851.413);
})
