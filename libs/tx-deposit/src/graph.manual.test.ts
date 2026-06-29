import { jest } from '@jest/globals';
import { init as FirestoreInit, getFirestore } from '@thecointech/firestore';
import { ContractCore } from '@thecointech/contract-core';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import { BuyAction } from '@thecointech/broker-db';
import * as brokerDbTxs from '@thecointech/broker-db/transaction';
import { getSigner } from '@thecointech/signers';

jest.useFakeTimers();

const getSingle = jest.fn<(currency: number, timestamp: number) => Promise<any>>();
jest.unstable_mockModule('@thecointech/apis/pricing', () => ({
  GetRatesApi: () => ({
    getSingle,
  })
}))

jest.unstable_mockModule('@thecointech/broker-db/transaction', () =>
  Object.keys(brokerDbTxs).reduce((acc, key) => ({ ...acc, [key]: jest.fn() }), {})
);

// The action was created on Saturday noon (before market open)
const createDate = DateTime.now()
  .minus({ days: DateTime.now().weekday + 1 })
  .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

// The deposit happened on sunday
const depositDate = createDate.plus({ days: 1 });

const depositAmount = new Decimal(100);
const fxRate = 2.0; // 1 coin = $2 fiat

beforeEach(async () => {
  await FirestoreInit();
  // It's currently monday at noon when we are processing this
  jest.setSystemTime(depositDate.plus({ day: 1 }).toJSDate());
  jest.resetAllMocks();
  getSingle.mockResolvedValue({
    status: 200,
    data: { fxRate: 1, sell: fxRate, buy: fxRate },
  });
});

it('manual deposit uses the deposit date for conversion, not the action creation date', async () => {
  const { manual } = await import('./graph.manual');
  const { StateMachineProcessor, getCurrentState } = await import('@thecointech/tx-statemachine');

  const deposit = {
    fiat: depositAmount,
    meta: 'test-deposit',
    date: depositDate,
  };

  const action: BuyAction = {
    address: '0x0000000000000000000000000000000000000001',
    type: 'Buy',
    data: {
      initial: { amount: depositAmount, type: 'other' },
      initialId: 'test-manual-1',
      date: createDate,  // action created Sunday; deposit happened Wednesday
    },
    history: [],
    doc: getFirestore().doc('/Buy/test-manual-1') as unknown as BuyAction['doc'],
  };

  const contract = await ContractCore.connect(await getSigner("BrokerCAD"));
  const processor = new StateMachineProcessor(manual(deposit), contract, null);

  const container = await processor.execute(null, action);
  const finalState = getCurrentState(container);
  expect(finalState.name).toBe('complete');

  // toCoin must have fetched the rate using the deposit date, not the action creation date.
  expect(getSingle).toHaveBeenCalledTimes(1);
  const [[, calledTimestamp]] = getSingle.mock.calls as [[number, number]];

  // nextOpenTimestamp(depositDate=Sunday) == monday morning. 
  const settledDate = DateTime.fromMillis(calledTimestamp);
  expect(settledDate.weekday).toBe(1); // Monday
  expect(settledDate.hour).toBe(9);
  expect(settledDate.minute).toBe(32);

  const dates = container.history.map(h => h.data.date);
  expect(dates[0]).toEqual(createDate)
  expect(dates[1]).toEqual(depositDate)
  expect(dates[2].toString()).toEqual(settledDate.toString())
  expect(finalState.data.date.toMillis()).toBe(settledDate.toMillis());

  // We convert to coin
  expect(container.history[2].delta.coin?.gt(0)).toBeTruthy();
  // But end flat
  expect(finalState.data.coin?.isZero()).toBeTruthy();
  expect(finalState.data.fiat?.isZero()).toBeTruthy();
});
