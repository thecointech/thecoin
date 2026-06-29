import { jest } from '@jest/globals';
import { init as FirestoreInit, getFirestore } from '@thecointech/firestore';
import { ContractCore } from '@thecointech/contract-core';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import { BuyAction } from '@thecointech/broker-db';
import { getSigner } from '@thecointech/signers';
import { ETransferErrorCode } from '@thecointech/bank-interface';
import type { eTransferData } from '@thecointech/tx-gmail';
import { RbcApi } from '@thecointech/rbcapi';
import { GetRatesApi } from '@thecointech/apis/pricing';

jest.useFakeTimers();

const ratesApi = GetRatesApi()
const getSingleSpy = jest.spyOn(ratesApi, 'getSingle')

const bank = await RbcApi.create();
const depositSpy = jest.spyOn(bank, 'depositETransfer');

// e-Transfer was received on Saturday noon
const recieved = DateTime.now()
  .minus({ days: DateTime.now().weekday + 1 })
  .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

// Action was created at the same time the e-transfer arrived
const createDate = recieved;

// We process it on Monday (next open market day)
const processingTime = recieved.plus({ days: 2 }).set({ hour: 14, minute: 0, second: 0, millisecond: 0 });

const depositAmount = new Decimal(100);
const userAddress = '0x0000000000000000000000000000000000000001';

const instructions: eTransferData = {
  name: 'Test User',
  email: 'test@example.com',
  id: 'etransfer-abc-123',
  cad: depositAmount,
  address: userAddress,
  recieved,
  depositUrl: 'https://example.com/deposit',
  // no `raw` — labelEmail will gracefully log and return { meta: 'Tag not set' }
};

beforeEach(async () => {
  await FirestoreInit();
  // Processing happens on Monday
  jest.setSystemTime(processingTime.toJSDate());
  jest.clearAllMocks();
});

it('etransfer deposit uses the deposit time for conversion, not the action creation date', async () => {
  const { etransfer } = await import('./graph.etransfer');
  const { StateMachineProcessor, getCurrentState } = await import('@thecointech/tx-statemachine');

  const action: BuyAction = {
    address: userAddress,
    type: 'Buy',
    data: {
      initial: { amount: depositAmount, type: 'etransfer' },
      initialId: 'test-etransfer-1',
      date: createDate,
    },
    history: [],
    doc: getFirestore().doc('/Buy/test-etransfer-1') as unknown as BuyAction['doc'],
  };

  const contract = await ContractCore.connect(await getSigner("BrokerCAD"));
  const processor = new StateMachineProcessor(etransfer, contract, bank);

  const container = await processor.execute(instructions, action);
  const finalState = getCurrentState(container);
  expect(finalState.name).toBe('complete');

  // depositFiat sets date: DateTime.now() — which is Monday (processingTime)
  // toCoin calls nextOpenTimestamp(Monday) => Monday market open at 9:32
  expect(getSingleSpy).toHaveBeenCalledTimes(1);
  const [[, calledTimestamp]] = getSingleSpy.mock.calls as [[number, number]];
  const settledDate = DateTime.fromMillis(calledTimestamp);
  expect(settledDate.weekday).toBe(1); // Monday
  expect(settledDate.hour).toBe(9);
  expect(settledDate.minute).toBe(32);

  // Verify date propagation through states:
  // [0] initial    => createDate (seeded from action.data.date)
  // [1] labelled   => no date delta, inherits createDate
  // [2] depositReady => preTransfer, no date delta
  // [3] depositResult => depositFiat sets date: DateTime.now() (Monday)
  // ...onwards inherits Monday
  const dates = container.history.map(h => h.data.date);
  expect(dates[0].toMillis()).toBe(createDate.toMillis());
  // toCoin's settled date should match what getSingle was called with
  const toCoinIdx = container.history.findIndex(h => h.delta.type === 'toCoin');
  expect(dates[toCoinIdx].toMillis()).toBe(settledDate.toMillis());
  // Final state inherits the settled date
  expect(finalState.data.date.toMillis()).toBe(settledDate.toMillis());

  // bank.depositETransfer was called once
  expect(depositSpy).toHaveBeenCalledTimes(1);

  // Coin was produced by toCoin
  expect(container.history[toCoinIdx].delta.coin?.gt(0)).toBeTruthy();

  // After sendCoin the coin balance resets to zero
  expect(finalState.data.coin?.isZero()).toBeTruthy();
  expect(finalState.data.fiat?.isZero()).toBeTruthy();
});

it('etransfer deposit fails gracefully when bank is unavailable', async () => {
  const { etransfer } = await import('./graph.etransfer');
  const { StateMachineProcessor, getCurrentState } = await import('@thecointech/tx-statemachine');

  depositSpy.mockResolvedValue({
    code: ETransferErrorCode.UnknownError,
    message: 'Bank API unavailable',
  });

  const action: BuyAction = {
    address: userAddress,
    type: 'Buy',
    data: {
      initial: { amount: depositAmount, type: 'etransfer' },
      initialId: 'test-etransfer-fail',
      date: createDate,
    },
    history: [],
    doc: getFirestore().doc('/Buy/test-etransfer-fail') as unknown as BuyAction['doc'],
  };

  const contract = await ContractCore.connect(await getSigner("BrokerCAD"));
  const processor = new StateMachineProcessor(etransfer, contract, bank as any);

  const container = await processor.execute(instructions, action);
  const finalState = getCurrentState(container);

  // Should land in error state (depositResult.onError -> requestManual -> error)
  expect(finalState.name).toBe('error');
  // No conversion should have happened
  expect(getSingleSpy).not.toHaveBeenCalled();
});
