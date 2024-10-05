import { DateTime } from 'luxon';
import currency from 'currency.js';
import { Wallet } from 'ethers';
import { getDateFromPrior, PayVisa } from './PayVisa';

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

const mockData = (dueInWeeks: number) => ({
  state: {
    visa: {
      dueDate: DateTime.now().plus({ weeks: dueInWeeks }),
      dueAmount: new currency(100),
    },
    state: {},
  } as any,
  user: {
    wallet: Wallet.createRandom(),
    replay: null as any,
    creditDetails: {
      payee: 'payee',
      accountNumber: "12345"
    }
  }
})
