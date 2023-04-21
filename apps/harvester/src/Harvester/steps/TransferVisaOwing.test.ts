import currency from 'currency.js';
import { TransferVisaOwing } from './TransferVisaOwing'
import { DateTime } from 'luxon';

it ('xfers correctly', async () => {

  const state: any = {
    visa: {
      balance: currency(500),
      history: [],
    },
    delta: [],
    state: {},
  }
  const xferOwing = new TransferVisaOwing();
  const runWith = async (spending?: number) => {
    state.visa.balance = state.visa.balance.add(spending || 0);
    state.delta = [];
    const d = await xferOwing.process(state);
    // Remember other data
    state.state.stepData = d.stepData;
    return d;
  }
  const d1 = await runWith();
  expect(d1.toETransfer).toEqual(currency(500));

  // No new spending, no new transfer
  const d2 = await runWith();
  expect(d2.toETransfer).toBeUndefined();

  // $20 more spending
  const d3 = await runWith(20);
  expect(d3.toETransfer).toEqual(currency(20));

  // The order to pay is sent, and 30 more is spent
  const visaPayment = state.visa.balance;
  state.state.toPayVisa = visaPayment;
  const d4 = await runWith(30);
  expect(d4.toETransfer).toEqual(currency(30));

  // The order to pay is settled, and 10 more is spent
  state.visa.history.push({
    credit: visaPayment,
  })
  state.visa.balance = state.visa.balance.subtract(visaPayment);
  const d5 = await runWith(10);
  expect(d5.toETransfer).toEqual(currency(10));
  expect(d5.toPayVisa).toBeUndefined();

  // Can we handle if we miss the payment info?
  state.state.toPayVisa = currency(10);
  state.visa.balance = state.visa.balance.subtract(10);
  state.state.stepData['PayVisaKey'] = DateTime.now().minus({ days: 7 }).toISO();
  const d6 = await runWith(20);
  expect(d6.toETransfer).toEqual(currency(20));

  // Even if the payment now shows up, it doesn't affect anything
  state.visa.history.push({
    credit: currency(10),
  })
  state.state.toPayVisa = currency(10);
  const d7 = await runWith();
  expect(d7.toPayVisa).toEqual(currency(10));

  // Now there is a $100 payment pending
  // newState.state.toPayVisa = currency(100);
})
