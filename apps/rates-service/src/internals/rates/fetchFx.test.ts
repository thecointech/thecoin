import { DateTime } from 'luxon';
import { fetchFxRate } from './fetchFx';
import { CurrencyCode } from '@thecointech/fx-rates';
import { FXUpdateInterval } from './types';

it('should find a valid fx rate', async () => {

  const lastValidTill = DateTime.fromISO("2023-07-27T07:31:30", { zone: "utc" });
  const queryTime = DateTime.fromISO("2023-07-27T07:31:04", { zone: "utc" });
  const rate = await fetchFxRate(lastValidTill.toMillis(), queryTime.toMillis());
  // We should have a rate
  expect(rate).toBeTruthy();
  expect(rate[CurrencyCode.CAD]).toBeTruthy();
  expect(rate!.validFrom).toEqual(lastValidTill.toMillis());
  // Next valid-until
  // validTill: Thu Jul 02 2020 14:31:30 GMT-0500 (Central Daylight Time) {}
  expect(rate!.validTill).toEqual(lastValidTill.plus(FXUpdateInterval).toMillis());
})
