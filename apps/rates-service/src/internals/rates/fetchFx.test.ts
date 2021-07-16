import { fetchFxRate } from './fetchFx';
import { CurrencyCode } from '@thecointech/fx-rates';

// Don't go to the server for this
jest.mock('../FinnHub')

it('should find a valid fx rate', async () => {

  // query time doesn't matter
  var queryTime = 1593714810000;
  const rate = await fetchFxRate(queryTime, queryTime + 10000);
  // We should have a rate
  expect(rate).toBeTruthy();
  expect(rate[CurrencyCode.CAD]).toBeTruthy();
  expect(rate!.validFrom).toEqual(queryTime);
  // Next valid-until
  // validTill: Thu Jul 02 2020 14:31:30 GMT-0500 (Central Daylight Time) {}
  expect(rate!.validTill).toEqual(1593718290000);
})
