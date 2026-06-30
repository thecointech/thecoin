import { jest } from "@jest/globals";
import { init as FirestoreInit, getFirestore } from '@thecointech/firestore';
import { ContractCore } from '@thecointech/contract-core';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import { BillAction } from '@thecointech/broker-db';
import { getSigner } from '@thecointech/signers';
import { GetRatesApi } from '@thecointech/apis/pricing';
import { RbcApi } from '@thecointech/rbcapi';
import type { BillPayeePacket } from '@thecointech/types';
import { uberGraph } from './uberGraph';
import { StateMachineProcessor, getCurrentState } from '@thecointech/tx-statemachine';
import { ContractConverter } from '@thecointech/contract-plugin-converter';

jest.useFakeTimers();

const ratesApi = GetRatesApi();
const getSingleSpy = jest.spyOn(ratesApi, 'getSingle');

const bank = await RbcApi.create();
const payBillSpy = jest.spyOn(bank, 'payBill');

// Action created Saturday noon
const createDate = DateTime.now()
  .minus({ weeks: 2, days: DateTime.now().weekday + 1 })
  .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

// First processed on the Monday (register, no settle)
const processingTime = createDate.plus({ days: 2 }).set({ hour: 14, minute: 0, second: 0, millisecond: 0 });
// UberTransfer settles Friday afternoon
const transferTime = createDate.plus({ days: 6 })

const userAddress = '0x0000000000000000000000000000000000000001';

const instructions: BillPayeePacket = {
  payee: 'Hydro',
  accountNumber: '123456789',
};

beforeEach(async () => {
  await FirestoreInit();
  jest.clearAllMocks();
});

it('uberGraph bill payment: happy path reaches complete', async () => {
  jest.setSystemTime(processingTime.toJSDate());

  const action: BillAction = {
    address: userAddress,
    type: 'Bill',
    data: {
      initial: {
        transfer: {
          chainId: 1,
          from: userAddress,
          to: process.env.WALLET_BrokerCAD_ADDRESS!,
          amount: 100, // $100
          currency: 124,
          signedMillis: createDate.toMillis(),
          transferMillis: transferTime.toMillis(),
          signature: '',
        },
        instructionPacket: { encryptedPacket: '', version: '' },
        signature: '',
      },
      initialId: 'test-uber-bill-1',
      date: createDate,
    },
    history: [],
    doc: getFirestore().doc('/Bill/test-uber-bill-1') as unknown as BillAction['doc'],
  };

  const signer = await getSigner("BrokerCAD");
  const uc = await ContractConverter.connect(signer);
  const tcCore = await ContractCore.connect(signer);
  const uberTransferSpy = jest.spyOn(tcCore, 'uberTransfer');
  const processPendingSpy = jest.spyOn(uc, 'processPending');
  const parseLogSpy = jest.spyOn(tcCore.interface, 'parseLog');
  const processor = new StateMachineProcessor(uberGraph, tcCore, bank);

  // On our first run, waitForTransaction does not return
  // any logs (the default mock will return `ExactTransfer`)
  parseLogSpy.mockImplementationOnce(() => null);
  const initContainer = await processor.execute(instructions, action);
  const initState = getCurrentState(initContainer);
  // The transfer has been accepted and registered, but remains in 'waiting' state
  // until the transferMillis has passed.
  expect(initState.name).toBe('tcWaitToFinalize');
  expect(getSingleSpy).toHaveBeenCalledTimes(0);
  expect(uberTransferSpy).toHaveBeenCalledTimes(1);
  expect(processPendingSpy).toHaveBeenCalledTimes(0);
  expect(payBillSpy).toHaveBeenCalledTimes(0);

  // Process again wed, no change
  jest.setSystemTime(processingTime.plus({ days: 2 }).toJSDate());
  action.history = initContainer.history.map(h => h.delta).slice(1);
  const waitContainer = await processor.execute(instructions, action);
  const waitState = getCurrentState(waitContainer);
  expect(waitState.name).toBe('tcWaitToFinalize');
  expect(getSingleSpy).toHaveBeenCalledTimes(0);
  expect(uberTransferSpy).toHaveBeenCalledTimes(1);
  expect(waitContainer.history.length).toEqual(initContainer.history.length);

  // Process again fri, this time it settles
  jest.setSystemTime(processingTime.plus({ days: 5 }).toJSDate());
  const finalContainer = await processor.execute(instructions, action);
  const finalState = getCurrentState(finalContainer);
  expect(finalState.name).toBe('complete');

  // toFiat called getSingle once for the coin -> fiat conversion
  expect(processPendingSpy).toHaveBeenCalledTimes(1);
  expect(getSingleSpy).toHaveBeenCalledTimes(1);
  expect(payBillSpy).toHaveBeenCalledTimes(1);
  
  const [[, calledTimestamp]] = getSingleSpy.mock.calls as [[number, number]];
  const settledDate = DateTime.fromMillis(calledTimestamp);
  expect(settledDate).toEqual(transferTime);

  // Final state: fiat and coin are zeroed out
  expect(finalState.data.coin?.isZero()).toBeTruthy();
  expect(finalState.data.fiat?.isZero()).toBeTruthy();
})

