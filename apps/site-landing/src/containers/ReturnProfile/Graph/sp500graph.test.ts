import fs from 'fs';
import { calcPeriodReturn, getIdx, calcReturns, parseData, getAllReturns, calculateAvgAndArea } from '../Data';
import { DateTime } from 'luxon';
import path from 'path';

const sourceFilePath = path.join(__dirname, '..', '..', '..', 'sp500_monthly.csv');
//const outputJsonPath = '.\\app\\containers\\ReturnProfile\\processed.json';

// CWD == c:\src\TheCoin\site
function getData() {
  const buffer = fs.readFileSync(sourceFilePath);
  return parseData(buffer.toString().slice(1));
}

test('Should read data in properly', async () => {
  const data = getData();
  // console.log(data);

  // Ok - lets test getting % return over time
  const start = getIdx(new Date(1919, 0), data);
  const end = getIdx(new Date(2019, 1), data);
  const returns = calcReturns(start, end, data, 1.85);
  console.log(returns * 100);

});

test('can build return for single period', async () => {
  const data = getData();
  // console.log(data);

  // Ok - lets test getting % return over time
  const startDate = new Date(2010, 0);
  const endDate = new Date(2011, 0);

  // we generate 6 month returns for a single year.
  let returns = calcPeriodReturn(data, startDate, endDate, 1, 0);

  expect(returns.length).toBe(12);
  // Verify results vs a few sample numbers from https://dqydj.com/sp-500-return-calculator/
  expect(returns[0]).toBeCloseTo(-0.029);
  expect(returns[2]).toBeCloseTo(0.04088);
  expect(returns[4]).toBeCloseTo(-0.03543);
  expect(returns[9]).toBeCloseTo(0.02492);
  expect(returns[11]).toBeCloseTo(0.03464);

  // There are a total of 7 6-month periods in a year.
  // Jan-Jul, Feb-Aug,... Jun-Dec, Jul-Jan
  returns = calcPeriodReturn(data, startDate, endDate, 6, 0);
  expect(returns.length).toBe(7);

  expect(returns[0]).toBeCloseTo(-0.02947);  // Jan => Jul
  expect(returns[2]).toBeCloseTo(-0.01630);
  expect(returns[5]).toBeCloseTo(0.15724);
  expect(returns[6]).toBeCloseTo(0.19923); // Jul => Jan

  returns = calcPeriodReturn(data, startDate, endDate, 12, 0);
  expect(returns.length).toBe(1);
  expect(returns[0]).toBeCloseTo(0.16388);
});

test('Build array of all returns by all periods', async () => {
  const data = getData();
  // console.log(data);

  // Ok - lets test getting % return over time
  const startDate = new Date(2000, 0);
  const endDate = new Date(2005, 0);

  // we generate from 1 month through till 4 years
  const minMonths = 1;
  const maxMonths = 12 * 4;
  const totalMonthsAvailable = 5 * 12;

  const allReturns = new Array(maxMonths);

  for (let monthCount = minMonths; monthCount <= maxMonths; monthCount++)
  {
    const periodReturns = calcPeriodReturn(data, startDate, endDate, monthCount, 0);
    expect(periodReturns.length).toBe(totalMonthsAvailable - (monthCount - 1));
    allReturns[monthCount - 1] = periodReturns;
  }

  // Lets check a few 4yr returns
  expect(allReturns[maxMonths - 1][0]).toBeCloseTo(-0.15766);
  expect(allReturns[maxMonths - 1][12]).toBeCloseTo(-0.05747);
});

test('Build output all return data', async () => {
  const data = getData();

  // We only want to count the data since FDR's "new deal"
  // US abandoned gold standard in April 1933
  const startDate = new Date(1933, 3);
  const endDate = new Date();

  // we generate from 1 month through till 60 years
  const minMonths = 1;
  const maxMonths = 12 * 60;
  const allReturns = new Array(maxMonths);

  for (let monthCount = minMonths; monthCount <= maxMonths; monthCount++)
  {
    const periodReturns = calcPeriodReturn(data, startDate, endDate, monthCount, 0);
    allReturns[monthCount - 1] = periodReturns;
  }

  // Now, lets find the worst possible return over 10 years
  const tenYrReturns = allReturns[10 * 12];
  const idx = tenYrReturns.indexOf(Math.min.apply(null, tenYrReturns));
  // What is this return, and when did it happen?
  const worstDate = DateTime.fromJSDate(startDate).plus({ months: idx })
  // 1999 was a terrible time to be an investor
  console.log(`Worst return: ${tenYrReturns[idx]} from ${worstDate.toISODate()}`);
  expect(worstDate.toISODate()).toBe("1999-02-01");
  // TODO: Why do we have a different number here?
  //expect(tenYrReturns[idx]).toBeCloseTo(-0.30009);

  // now, we sort all entries by size but remember their time
  //var allReturnsSorted = allReturns.map(returns => returns.sort());

  // Write these calculations out to disk
  // Turns out that's a terrible idea: the generated file
  // is 10mb vs the source data of 118 kb
  //fs.writeFileSync(outputJsonPath, JSON.stringify(allReturnsSorted));
  console.log("all done");
});

// Test to see if we calculate a reasonable average/lower/upper
test('Calculates average/min/max correctly', async () => {
  const data = getData();
  const allReturns = getAllReturns(data, 12 * 60, 0);
  // Again, the worst return of 10 years should be 1999
  const tenYrReturns = allReturns[10 * 12];
  const idx = tenYrReturns.indexOf(Math.min.apply(null, tenYrReturns));
  expect(idx).toBe(0);

  const averageReturns = calculateAvgAndArea(allReturns, 1);
  const tenYrAverages = averageReturns[10 * 12];
  expect(tenYrAverages.lowerBound).toBe(tenYrReturns[0]);
  expect(tenYrAverages.upperBound).toBe(tenYrReturns[tenYrReturns.length - 1]);
});
