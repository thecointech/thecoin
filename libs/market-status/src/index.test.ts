import { jest } from '@jest/globals';
import { nextOpenTimestamp } from '.';
import { DateTime } from 'luxon';
import { describe } from '@thecointech/jestutils';
import { ifSecret } from '@thecointech/secrets/jestutils';

const jan1st2019 = DateTime.fromObject({year: 2019, month: 1, day: 1});

jest.setTimeout(60000);

describe("Live MarketStatus tests", () => {

  it("Returns now if the market is currently open", async () => {
    const testCurrOpen = DateTime.fromObject({year: 2019, month: 3, day: 29, hour: 12, minute: 30});
    expect(testCurrOpen.weekday == 5); // Check is friday
    const nts = await nextOpenTimestamp(testCurrOpen);
    expect(nts).toBe(testCurrOpen.toMillis());
  });

  it("Gives valid offset time", async () => {
    const nts = await nextOpenTimestamp(jan1st2019);
    const dt = DateTime.fromMillis(nts);
    expect(dt.toString()).toMatch("2019-01-02T09:32:00.000-05:00");
  });

  it("Gives valid future time without offset", async () => {
    const nts = await nextOpenTimestamp(jan1st2019, 0);
    const dt = DateTime.fromMillis(nts);
    expect(dt.toString()).toMatch("2019-01-02T09:30:00.000-05:00");
  });

  it("Gets next date when month ends on weekend", async () => {
    const testMonthIncr = DateTime.fromSQL("2019-03-29 16:30");
    expect(testMonthIncr.day == 5);
    const nts = await nextOpenTimestamp(testMonthIncr);
    const ndate = DateTime.fromMillis(nts);
    expect(ndate.toString()).toMatch("2019-04-01T09:32:00.000-04:00");
  });
}, await ifSecret("TradierApiKey"))
