import { DateTime } from 'luxon';
import currency from 'currency.js';
import { getDateFromPrior, PayVisa } from './PayVisa';
import { mockUser } from '../../../internal/mockUser';

it ("calculates dateToPay correctly", async () => {
  // A Monday
  const base = DateTime.fromSQL("2023-04-17");
  expect((await getDateFromPrior(base, 1)).weekdayShort).toEqual("Fri");
  expect((await getDateFromPrior(base, 3)).weekdayShort).toEqual("Wed");
})

it ('triggers a new payment when necessary', async () => {

  const payVisa = new PayVisa();

  const { state, user } = mockData(1);
  const delta1 = await payVisa.process(state, user);
  state.state = delta1;
  expect(delta1.toPayVisa).toEqual(currency(100));

  // Next day, no new payments
  const delta2 = await payVisa.process(state, user);
  expect(delta2).toEqual({});

  // we have a new due date, pay the visa again
  state.visa = {
    balance: currency(200),
    dueDate: DateTime.now().plus({ weeks: 2 }),
    dueAmount: new currency(125),
  };
  state.state.toPayVisa = undefined;
  state.state.toPayVisaDate = undefined;
  const delta3 = await payVisa.process(state, user);
  expect(delta3.toPayVisa).toEqual(currency(125));
})

it ('it sends immediately in near future', async () => {
  const payVisa = new PayVisa();
  const now = Date.now();
  const { state, user } = mockData(0.125); // Roughly tomorrow
  const delta = await payVisa.process(state, user);
  expect(delta.toPayVisaDate?.toMillis()).toBeGreaterThanOrEqual(now);
})

it ('it sends immediately for the past', async () => {
  const payVisa = new PayVisa();
  const now = Date.now();
  const { state, user } = mockData(-0.125); // Roughly yesterday
  const delta = await payVisa.process(state, user);
  expect(delta.toPayVisaDate?.toMillis()).toBeGreaterThanOrEqual(now);
})

it ('does not send more than the current balance', async () => {
  const payVisa = new PayVisa();
  const { state, user } = mockData(1);
  state.visa.balance = currency(50);
  const delta = await payVisa.process(state, user);
  expect(delta.toPayVisa).toEqual(currency(50));
})

it ('skips when dueAmount is $0', async () => {
  const payVisa = new PayVisa();
  const { state, user } = mockData(1);
  state.visa.dueAmount = currency(0);
  const delta = await payVisa.process(state, user);
  expect(delta).toEqual({});
})

it ('skips when date is new but more than 3 weeks away and amount unchanged', async () => {
  const payVisa = new PayVisa();
  const { state, user } = mockData(4); // 4 weeks out — outside window
  state.state.stepData = {
    PayVisa: DateTime.now().plus({ weeks: 3 }).toISO()!,
    PayVisaAmount: '100', // same amount as mockData default
  };
  const delta = await payVisa.process(state, user);
  expect(delta).toEqual({});
})

it ('pays when date is new and amount changed, even if more than 3 weeks away', async () => {
  const payVisa = new PayVisa();
  const { state, user } = mockData(4); // 4 weeks out — outside window
  state.state.stepData = {
    PayVisa: DateTime.now().plus({ weeks: 3 }).toISO()!,
    PayVisaAmount: '50', // different from mockData default of 100
  };
  const delta = await payVisa.process(state, user);
  expect(delta.toPayVisa).toEqual(currency(100));
})

it ('pays when date is new and within 3-week window, even if amount unchanged', async () => {
  const payVisa = new PayVisa();
  const { state, user } = mockData(2); // 2 weeks out — inside window
  state.state.stepData = {
    PayVisa: DateTime.now().plus({ weeks: 1 }).toISO()!,
    PayVisaAmount: '100', // same amount
  };
  const delta = await payVisa.process(state, user);
  expect(delta.toPayVisa).toEqual(currency(100));
})

const mockData = (dueInWeeks: number) => ({
  state: {
    visa: {
      balance: currency(200),
      dueDate: DateTime.now().plus({ weeks: dueInWeeks }),
      dueAmount: new currency(100),
    },
    state: {},
  } as any,
  user: mockUser(),
})
