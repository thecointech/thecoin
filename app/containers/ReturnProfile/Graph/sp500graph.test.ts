import fs from 'fs';
import util from 'util';
import { calcPeriodReturn, getIdx, calcReturns, parseData, bucketValues } from './Data';
const readfile = util.promisify(fs.readFile);

async function getData() {
  const buffer = await readfile('C:/src/TheCoin/the-website-ts/build/sp500_monthly.csv');
  return parseData(buffer.toString().slice(1));
}

test('Should read data in properly', async () => {
  const data = await getData();
  // console.log(data);

  // Ok - lets test getting % return over time
  const start = getIdx(new Date(1919, 0), data);
  const end = getIdx(new Date(2019, 1), data);
  const returns = calcReturns(start, end, data, 1.85);
  console.log(returns * 100);

});

test('can build returns data', async () => {
  const data = await getData();
  // console.log(data);

  // Ok - lets test getting % return over time
  const startDate = new Date(2018, 10);
  const endDate = new Date();

  const returns = calcPeriodReturn(data, startDate, endDate, 6, 0);
  console.log(returns);
});

test('can build bucketted returns data', async () => {
  const data = await getData();
  // console.log(data);

  // Ok - lets test getting % return over time
  const startDate = new Date(1919, 0);
  const endDate = new Date();

  const returns = calcPeriodReturn(data, startDate, endDate, 6, 0);
  const bucketted = bucketValues(returns, 20);
  //expect)(bucketted.min
  console.log(bucketted.values);
});
