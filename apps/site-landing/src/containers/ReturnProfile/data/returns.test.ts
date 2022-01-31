import { calcAllReturns, calculateAvgAndArea } from './returns';
import { Duration } from 'luxon';
import { getData, getDate } from './fetch.test';
import { getIdx } from './market';
import { createParams } from './params';


it('Runs the simulator the correct number of times', async () => {
  // console.log(data);

  // Ok - lets test getting % return over time
  const startDate = getDate(2000, 1);
  const endDate = getDate(2005, 7);
  const data = getData();
  const startIdx = getIdx(startDate, data);
  const endIdx = getIdx(endDate, data);
  const slice = data.slice(startIdx, endIdx);

  // Do we generate all possible returns?
  const params = createParams({maxDuration: {years: 5}})
  const periodReturns = calcAllReturns(slice, params);
  expect(periodReturns.length).toBe(65); // 5 full-length & 60 smaller ones

  // each subsequent period should be 1 month shorter
  periodReturns.forEach((p, idx) => {
    const simDuration = p[0].date.diff(p[p.length-1].date, "months");
    const offset = Math.max(0, idx - 5);
    const months = Math.floor(-simDuration.months);
    expect(months).toBe(60 - offset);
  })
});

// Test to see if we calculate a reasonable average/lower/upper
test('Calculates average/min/max correctly', async () => {
  const data = getData();
  const idx = getIdx(getDate(2000, 1), data);
  const params = createParams({initialBalance: 100, maxDuration: {years: 10}});
  const allReturns = calcAllReturns(data.slice(idx), params);
  // the worst return of 10 years should be 1999
  const averageReturns = calculateAvgAndArea(allReturns, data, 1);

  const weeksIn10Yrs = Duration.fromObject({years: 10}).as("weeks");
  const averaged10Yr = averageReturns[Math.round(weeksIn10Yrs)];
  // When was the worst moment in history to start investing?
  // If you bought on Aug 2000, you were ~ 13% down 10 years later.
  expect(averaged10Yr.values[0].date.toSQLDate()).toBe('2010-07-27');
});
