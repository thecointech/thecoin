const { GetCalendar, NextOpenTimestamp } = require('./MarketStatus');

const jan1st2019 = new Date(1546320600 * 1000);
test("Returns Valid Calendar", async () => {
	
	const calendar1 = await GetCalendar(jan1st2019);
	expect(calendar1).toHaveProperty('days');

	// Ensure cache returns valid value again
	const calendar2 = await GetCalendar(jan1st2019);
	expect(calendar2).toHaveProperty('days');
});

test("Returns now if the market is currently open", async () => {

	const testCurrOpen = new Date("2019-03-29 12:30");
	expect(testCurrOpen.getDay() == 4); // Check is friday
	const nts = await NextOpenTimestamp(testCurrOpen);
	expect(nts).toBe(testCurrOpen.getTime());
});

test("Gives valid offset time", async () => {
	const nts = await NextOpenTimestamp(jan1st2019);
	const ndate = new Date(nts);
	expect(ndate.toString()).toMatch("Wed Jan 02 2019 09:30:00 GMT-0500 (Eastern Standard Time)");
});

test("Getting next date when month ends on weekend", async () => {

	const testMonthIncr = new Date("2019-03-29 16:30");
	expect(testMonthIncr.getDay() == 4); // Check is saturday
	const nts = await NextOpenTimestamp(testMonthIncr);
	const ndate = new Date(nts);
	expect(ndate.toUTCString()).toMatch("Mon, 01 Apr 2019 13:30:00 GMT");
});