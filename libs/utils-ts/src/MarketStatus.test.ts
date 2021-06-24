import { GetCalendar, NextOpenTimestamp } from './MarketStatus';
import { DateTime } from 'luxon';

const jan1st2019 = DateTime.fromObject({year: 2019, month: 1, day: 1, zone: "America/New_York"});

test("Returns Valid Calendar", async () => {

	const calendar1 = await GetCalendar(jan1st2019.toJSDate());
	expect(calendar1).toHaveProperty('days');

	// Ensure cache returns valid value again
	const calendar2 = await GetCalendar(jan1st2019.toJSDate());
	expect(calendar2).toHaveProperty('days');
});

test("Returns now if the market is currently open", async () => {

	const testCurrOpen = DateTime.fromObject({year: 2019, month: 3, day: 29, hour: 12, minute: 30, zone: "America/New_York"});
	expect(testCurrOpen.weekday == 5); // Check is friday
	const nts = await NextOpenTimestamp(testCurrOpen.toJSDate());
	expect(nts).toBe(testCurrOpen.toMillis());
});

test("Gives valid offset time", async () => {
  const nts = await NextOpenTimestamp(jan1st2019.toJSDate());
  const dt = DateTime.fromMillis(nts).setZone('America/New_York');
	expect(dt.toString()).toMatch("2019-01-02T09:32:00.000-05:00");
});

test("Gives valid future time without offset", async () => {
	const nts = await NextOpenTimestamp(jan1st2019.toJSDate(), 0);
	const dt = DateTime.fromMillis(nts).setZone('America/New_York');
	expect(dt.toString()).toMatch("2019-01-02T09:30:00.000-05:00");
});

test("Getting next date when month ends on weekend", async () => {

	const testMonthIncr = new Date("2019-03-29 16:30");
	expect(testMonthIncr.getDay() == 4); // Check is saturday
	const nts = await NextOpenTimestamp(testMonthIncr);
	const ndate = new Date(nts);
	expect(ndate.toUTCString()).toMatch("Mon, 01 Apr 2019 13:32:00 GMT");
});
