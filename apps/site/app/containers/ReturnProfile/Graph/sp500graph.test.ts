import fs from 'fs';
import util from 'util';
import { calcPeriodReturn, getIdx, calcReturns, parseData, bucketValues, arrayMin, arrayMax, calcBucketShape, CalcIndex } from '../Data';
const readfile = util.promisify(fs.readFile);

// CWD == c:\src\TheCoin\site
async function getData() {
  const buffer = await readfile('sp500_monthly.csv');
  //console.log(buffer)
  return parseData(buffer.toString().slice(1));
}

test('Should read data in properly', async () => {
  const data = await getData();
  // console.log(data);

  // Ok - lets test getting % return over time
  const start = getIdx(new Date(1919, 0), data);
  const end = getIdx(new Date(2019, 1), data);
  const returns = calcReturns(start, end, data);
  console.log(returns * 100);

});

test('can build returns data', async () => {
  const data = await getData();
  // console.log(data);

  // Ok - lets test getting % return over time
  const startDate = new Date(2018, 10);
  const endDate = new Date();

  const returns = calcPeriodReturn(data, startDate, endDate, 6);
  console.log(returns);
});


test('can build average return graph', async () => {
  const data = await getData();

  console.log("---------DATA!!---------", data[0]);
  const firstYear = 1935;
  const iterations = 10;
  const monthsWeWantToGraph = 7*12;
  const startDate = new Date(firstYear, 0);
  const returns = Array(monthsWeWantToGraph);
  const average = Array(monthsWeWantToGraph);

  var endDate;
  var monthToInsert = 1;
  var beginDate = startDate;

  for (let y = 1; y <= iterations; y++){
    returns[y] = Array(monthsWeWantToGraph);
    monthToInsert = 1;
    for (let i = y; i < monthsWeWantToGraph+y; i++) {
      endDate = new Date(firstYear, i);
      beginDate = new Date(firstYear, i-1);
      returns[y][monthToInsert] = calcPeriodReturn(data, beginDate, endDate, monthToInsert)[0];
      if (typeof average[monthToInsert] == 'undefined'){
        average[monthToInsert] = (calcPeriodReturn(data, beginDate, endDate, monthToInsert)[0]);
      } else {
        average[monthToInsert] = average[monthToInsert] + (calcPeriodReturn(data, beginDate, endDate, monthToInsert)[0]);
      }
      monthToInsert = monthToInsert+1;
    }
  }

  for (let x = 1; x <= monthsWeWantToGraph; x++){
    //console.log(x,average[x]/iterations);
  }
  //console.table(returns);
});


test('can build bucketted returns data', async () => {
  const data = await getData();
  // console.log(data);

  // Ok - lets test getting % return over time
  const startDate = new Date(1919, 0);
  const endDate = new Date();

  const returns = calcPeriodReturn(data, startDate, endDate, 6);
  const bucketted = bucketValues(returns, 20);
  // expect)(bucketted.min
  console.log(bucketted.values);
});

function verifyBuckets(values: number[], numBuckets: number) {
  const minValue = arrayMin(values);
  const maxValue = arrayMax(values);

  // Spread
  const { min, max, size } = calcBucketShape(minValue, maxValue, numBuckets);

  const count = Math.round((max - min) / size);
  const bucketCount = Math.max(count + 1, numBuckets);
  const buckets: number[][] = Array(bucketCount);
  for (const v of values) {
    const idx = CalcIndex(min, max, v, count);
    if (!buckets[idx]) {
      buckets[idx] = [];
    }
    buckets[idx].push(v);
  }
  return buckets;
}

test('verify bucketting', async () => {
  const data = await getData();
  const monthCount = 1;
  const numBuckets = 30;
  const startDate = new Date(1919, 0);
  const returns = calcPeriodReturn(data, startDate, new Date(), monthCount);
  const { size, values, average } = bucketValues(returns, numBuckets);
  expect(size).toBe(0.05);

  const vData = verifyBuckets(returns, numBuckets);
  expect(values.length).toBe(vData.length);

  const avg1 = returns.reduce((p, v) => p + v, 0) / returns.length;
  expect(avg1).toBe(average);

  // const avg = vData.reduce((prev, bucket) =>
  //   bucket ?
  //     prev + bucket.reduce((p, v) => p + v, 0) / bucket.length :
  //     prev
  // , 0) / vData.length;

  // expect(avg).toBe(average);
});