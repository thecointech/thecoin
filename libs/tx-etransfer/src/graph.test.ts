import { jest } from '@jest/globals';
import { init as FirestoreInit, getFirestore } from '@thecointech/firestore';
import { ContractCore } from '@thecointech/contract-core';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import { SellAction } from '@thecointech/broker-db';
import { getSigner } from '@thecointech/signers';
import { GetRatesApi } from '@thecointech/apis/pricing';
import { RbcApi } from '@thecointech/rbcapi';
import type { ETransferPacket } from '@thecointech/types';
import { graph } from './graph';
import { StateMachineProcessor, getCurrentState } from '@thecointech/tx-statemachine';

jest.useFakeTimers();

const ratesApi = GetRatesApi();
const getSingleSpy = jest.spyOn(ratesApi, 'getSingle');

const bank = await RbcApi.create();
const sendETransferSpy = jest.spyOn(bank, 'sendETransfer');

// Action created Saturday noon, 4 weeks ago
const now = DateTime.now();
const createDate = now
  .minus({ weeks: 4, days: now.weekday + 1 })
  .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

// Process on Monday afternoon
const processingTime = createDate.plus({ days: 2 }).set({ hour: 14, minute: 0, second: 0, millisecond: 0 });

const sellAmount = new Decimal(100000000);
const userAddress = '0x0000000000000000000000000000000000000001';

// Pre-decrypted instructions passed directly to avoid crypto in tests
const instructions: ETransferPacket = {
  email: 'user@example.com',
  question: 'What is the answer?',
  answer: 'forty-two',
};

beforeEach(async () => {
  await FirestoreInit();
  jest.clearAllMocks();
});

it('etransfer sell: happy path reaches complete', async () => {
  jest.setSystemTime(processingTime.toJSDate());

  const action: SellAction = {
    address: userAddress,
    type: 'Sell',
    data: {
      initial: {
        transfer: {
          chainId: 1,
          from: userAddress,
          to: process.env.WALLET_BrokerCAD_ADDRESS!,
          value: sellAmount.toNumber(),
          fee: 0,
          timestamp: createDate.toMillis(),
          signature: '',
        },
        instructionPacket: { encryptedPacket: '', version: '' },
        signature: '',
      },
      initialId: 'test-sell-1',
      date: createDate,
    },
    history: [],
    doc: getFirestore().doc('/Sell/test-sell-1') as unknown as SellAction['doc'],
  };

  const contract = await ContractCore.connect(await getSigner("BrokerCAD"));
  const processor = new StateMachineProcessor(graph, contract, bank);

  const container = await processor.execute(instructions, action);
  const finalState = getCurrentState(container);
  expect(finalState.name).toBe('complete');

  // depositCoin (tcReady) converts coin to fiat — getSingle called once for toFiat
  expect(getSingleSpy).toHaveBeenCalledTimes(1);

  // sendETransfer was called once with the fiat amount
  expect(sendETransferSpy).toHaveBeenCalledTimes(1);

  // Final state: fiat and coin are zeroed out
  expect(finalState.data.coin?.isZero()).toBeTruthy();
  expect(finalState.data.fiat?.isZero()).toBeTruthy();
});


it('etransfer sell: returned transfer triggers revert to coin', async () => {
  // Simulate the e-transfer being returned: waitETransfer produces the "etransfer: returned" error
  // Seed with history for a returned transfer (as we don't currently have an automated way to trigger this)

  // Revert on a Sunday.
  const revertTime = processingTime.plus({ weeks: 2, days: 6 });
  jest.setSystemTime(revertTime.plus({ days: 1 }).toJSDate());

  const action: SellAction = {
    address: userAddress,
    type: 'Sell',
    data: {
      initial: {
        transfer: {
          chainId: 1,
          from: userAddress,
          to: '0x0000000000000000000000000000000000000002',
          value: sellAmount.toNumber(),
          fee: 0,
          timestamp: createDate.toMillis(),
          signature: '',
        },
        instructionPacket: { encryptedPacket: '', version: '' },
        signature: '',
      },
      initialId: 'test-sell-revert',
      date: createDate,
    },
    history: [],
    doc: getFirestore().doc('/Sell/test-sell-revert') as unknown as SellAction['doc'],
  };

  // Seed action.history so the processor replays up through eTransferSent,
  // then hits the injected waitETransfer error and routes to the revert chain.
  // We need realistic delta shapes for the transitions being replayed.
  const fiatAmount = new Decimal(50);
  action.history = [
    // preTransfer (initial -> tcReady)
    { type: 'preTransfer', created: processingTime },
    // depositCoin (tcReady -> tcWaiting): coin deposited (at whatever exchange rate that is)
    { type: 'depositCoin', created: processingTime, coin: fiatAmount.times(40000) },
    // waitCoin (tcWaiting -> tcResult)
    { type: 'waitCoin', created: processingTime },
    // toFiat (tcResult -> converted): coin -> fiat
    { type: 'toFiat', created: processingTime, coin: new Decimal(0), fiat: fiatAmount, date: processingTime },
    // preTransfer (converted -> eTransferReady)
    { type: 'preTransfer', created: processingTime },
    // sendETransfer (eTransferReady -> eTransferSent): fiat zeroed, date set
    { type: 'sendETransfer', created: processingTime, meta: '9999', fiat: new Decimal(0) },
    // waitETransfer (eTransferSent -> eTransferComplete): returned error with date
    { type: 'waitETransfer', created: processingTime, error: 'etransfer: returned', date: revertTime },
  ];

  const contract = await ContractCore.connect(await getSigner("BrokerCAD"));
  const processor = new StateMachineProcessor(graph, contract, bank);

  const container = await processor.execute(instructions, action);
  const finalState = getCurrentState(container);
  expect(finalState.name).toBe('complete');

  // toCoin was called during the revert (getSingle called once for the revert conversion)
  expect(getSingleSpy).toHaveBeenCalledTimes(1);
  const [[, calledTimestamp]] = getSingleSpy.mock.calls as [[number, number]];

  // nextOpenTimestamp(depositDate=Sunday) == monday morning. 
  const settledDate = DateTime.fromMillis(calledTimestamp);
  expect(settledDate.weekday).toBe(1); // Monday
  expect(settledDate.hour).toBe(9);
  expect(settledDate.minute).toBe(32);

  // End state: coin and fiat both zero after sendCoin
  expect(finalState.data.coin?.isZero()).toBeTruthy();
  expect(finalState.data.fiat?.isZero()).toBeTruthy();
});
