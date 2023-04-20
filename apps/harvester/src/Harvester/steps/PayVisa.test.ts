import { jest } from '@jest/globals';
import { DateTime } from 'luxon';
import currency from 'currency.js';
import { Wallet } from 'ethers';

process.env.WALLET_BrokerCAD_ADDRESS = "0x" + "B".repeat(40);
jest.setTimeout(10000);
// jest.useFakeTimers()
jest.unstable_mockModule('../config', () => {
  return {
    getWallet: () => Wallet.createRandom(),
    getCreditDetails: () => ({
      payee: 'payee',
      accountNumber: "12345"
    })
  }
})

it ("calculates dateToPay correctly", async () => {

  const { getDateToPay } = await import('./PayVisa');

  // A Monday
  const base = DateTime.fromSQL("2023-04-17");
  expect(getDateToPay(base, 1).weekdayShort).toEqual("Fri");
  expect(getDateToPay(base, 3).weekdayShort).toEqual("Wed");
})


it ('triggers a new payment when necessary', async () => {

  const { PayVisa } = await import('./PayVisa');
  const payVisa = new PayVisa();
  const state: any = {
    visa: {
      dueDate: DateTime.now().plus({ weeks: 1 }),
      dueAmount: new currency(100),
    },
    state: {},
  }

  const delta1 = await payVisa.process(state);
  state.state = delta1;
  // Next day, no new payments
  const delta2 = await payVisa.process(state);
  expect(delta2).toEqual({});

  // we have a new due date, pay the visa again
  state.visa.dueDate = DateTime.now().plus({ weeks: 2 });
  const delta3 = await payVisa.process(state);
  expect(delta3.harvesterBalance).toEqual(currency(-200));
})
