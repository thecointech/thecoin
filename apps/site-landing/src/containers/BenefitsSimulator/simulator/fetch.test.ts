import { jest } from '@jest/globals';
import { DateTime } from 'luxon';
import { readFileSync } from 'fs';
import { fetchMarketData } from './fetch';
import { URL } from 'url'; // Import explicitly so we get the right (node/browser) version

const rootUrl = import.meta.url;
globalThis.fetch = jest.fn((name: string) =>
  Promise.resolve({
    text: () => {
      const buffer = readFileSync(new URL(`./${name}`, rootUrl));
      return Promise.resolve(buffer.toString());
    }
  }),
) as jest.Mock<typeof globalThis.fetch>;


export const getDate = (year: number, month: number) => DateTime.fromObject({year, month}, {zone: "America/New_York" })

// Basic data validation - is it all there?
it ('parsed the data correctly', async () => {
  const data = await fetchMarketData();

  // Check it is intact & continuous
  let lastMonth = data[0].Date.minus({month: 1});
  // Do we have all continuous dates?
  for (const r of data) {
    const thisMonth = lastMonth.plus({month: 1});
    expect(r.Date).toEqual(thisMonth);
    expect(r.Fx).toBeTruthy();
    lastMonth = thisMonth;
  }
  // test number parsing
  expect(data[0].D.mul).toBeDefined();
})

