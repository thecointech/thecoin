import { getData, getDate } from './fetch.test';
import { getIdx } from './market';

it ('can find index by date', () => {
  const data = getData();
  const testDate = (year:number, month: number) => {
    const date = getDate(year, month);
    const idx = getIdx(date, data);
    expect(data[idx].Date).toEqual(date);
  }
  testDate(1871, 1);
  testDate(1962, 9);
  testDate(2021, 12);
})
