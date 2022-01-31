import { DateTime } from 'luxon';
import { parseData } from './fetch';
import { readFileSync } from 'fs';
import { join } from 'path';

const sourceFilePath = join(__dirname, 'sp500_monthly.csv');

export function getData() {
  const buffer = readFileSync(sourceFilePath);
  return parseData(buffer.toString().slice(1));
}
export const getDate = (year: number, month: number) => DateTime.fromObject({year, month, zone: "America/New_York" })

// Basic data validation - is it all there?
it ('parsed the data correctly', () => {
  const data = getData();

  // Check it is intact & continuous
  let lastMonth = data[0].Date.minus({month: 1});
  // Do we have all continuous dates?
  for (const r of data) {
    const thisMonth = lastMonth.plus({month: 1});
    expect(r.Date).toEqual(thisMonth);
    lastMonth = thisMonth;
  }
  // test number parsing
  expect(data[0].D + 0).toEqual(data[0].D);
})

