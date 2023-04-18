import { DateTime } from 'luxon';
import { getDateToPay } from './PayVisa';

it ("calculates dateToPay correctly", async () => {

  // A Monday
  const base = DateTime.fromSQL("2023-04-17");
  expect(getDateToPay(base, 1).weekdayShort).toEqual("Fri");
  expect(getDateToPay(base, 3).weekdayShort).toEqual("Wed");
})
