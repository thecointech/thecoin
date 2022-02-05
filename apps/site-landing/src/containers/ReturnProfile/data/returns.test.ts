import { calcAllResultsImmediate } from './returns';
import { getData, getDate } from './fetch.test';
import { getIdx } from './market';
import { createParams } from './params';

// Test to see if we calculate a reasonable average/lower/upper
test('Calculates average/min/max correctly', async () => {
  const data = getData();
  const idx = getIdx(getDate(2000, 1), data);
  const params = createParams({initialBalance: 100});
  const averageReturns = calcAllResultsImmediate({data: data.slice(idx), params}, 521);

  // the worst return of 10 years should be 1999
  const averaged10Yr = averageReturns[520];
  // When was the worst moment in history to start investing?
  // If you bought on Aug 2000, you were ~ 13% down 10 years later.
  expect(averaged10Yr.values[0].date.toSQLDate()).toBe('2010-06-19');
});
