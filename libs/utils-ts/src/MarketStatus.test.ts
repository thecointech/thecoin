import { GetCalendar, NextOpenTimestamp } from './MarketStatus';
import { DateTime, Settings } from 'luxon';

Settings.defaultZoneName = "America/New_York";
const jan1st2019 = DateTime.fromObject({year: 2019, month: 1, day: 1});

it("Returns Valid Calendar", async () => {
	const calendar1 = await GetCalendar(jan1st2019.toJSDate());
	expect(calendar1).toHaveProperty('days');

	// Ensure cache returns valid value again
	const calendar2 = await GetCalendar(jan1st2019.toJSDate());
	expect(calendar2).toHaveProperty('days');
});

it("Returns now if the market is currently open", async () => {
	const testCurrOpen = DateTime.fromObject({year: 2019, month: 3, day: 29, hour: 12, minute: 30});
	expect(testCurrOpen.weekday == 5); // Check is friday
	const nts = await NextOpenTimestamp(testCurrOpen.toJSDate());
	expect(nts).toBe(testCurrOpen.toMillis());
});

it("Gives valid offset time", async () => {
  const nts = await NextOpenTimestamp(jan1st2019.toJSDate());
  const dt = DateTime.fromMillis(nts);
	expect(dt.toString()).toMatch("2019-01-02T09:32:00.000-05:00");
});

it("Gives valid future time without offset", async () => {
	const nts = await NextOpenTimestamp(jan1st2019.toJSDate(), 0);
	const dt = DateTime.fromMillis(nts);
	expect(dt.toString()).toMatch("2019-01-02T09:30:00.000-05:00");
});

it("Gets next date when month ends on weekend", async () => {
	const testMonthIncr = DateTime.fromSQL("2019-03-29 16:30");
	expect(testMonthIncr.day == 5);
	const nts = await NextOpenTimestamp(testMonthIncr.toJSDate());
	const ndate = DateTime.fromMillis(nts);
	expect(ndate.toString()).toMatch("2019-04-01T09:32:00.000-04:00");
});
