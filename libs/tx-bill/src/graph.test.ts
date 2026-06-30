import { jest } from '@jest/globals';
import { init as FirestoreInit, getFirestore } from '@thecointech/firestore';
import { ContractCore } from '@thecointech/contract-core';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import { BillAction } from '@thecointech/broker-db';
import { getSigner } from '@thecointech/signers';
import { GetRatesApi } from '@thecointech/apis/pricing';
import { RbcApi } from '@thecointech/rbcapi';
import type { BillPayeePacket } from '@thecointech/types';
import { graph } from './graph';
import { StateMachineProcessor, getCurrentState } from '@thecointech/tx-statemachine';

jest.useFakeTimers();

const ratesApi = GetRatesApi();
const getSingleSpy = jest.spyOn(ratesApi, 'getSingle');

const bank = await RbcApi.create();
const payBillSpy = jest.spyOn(bank, 'payBill');

// Action created Saturday noon
const createDate = DateTime.now()
  .minus({ days: DateTime.now().weekday + 1 })
  .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

// Process on Monday afternoon
const processingTime = createDate.plus({ days: 2 }).set({ hour: 14, minute: 0, second: 0, millisecond: 0 });

const billAmount = new Decimal(100000000);
const userAddress = '0x0000000000000000000000000000000000000001';

// Pre-decrypted instructions passed directly to avoid crypto in tests
const instructions: BillPayeePacket = {
  payee: 'Hydro',
  accountNumber: '123456789',
};

beforeEach(async () => {
  await FirestoreInit();
  jest.clearAllMocks();
});

it('bill payment: happy path reaches complete', async () => {
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
          value: billAmount.toNumber(),
          fee: 0,
          timestamp: createDate.toMillis(),
          signature: '',
        },
        instructionPacket: { encryptedPacket: '', version: '' },
        signature: '',
      },
      initialId: 'test-bill-1',
      date: createDate,
    },
    history: [],
    doc: getFirestore().doc('/Bill/test-bill-1') as unknown as BillAction['doc'],
  };

  const contract = await ContractCore.connect(await getSigner("BrokerCAD"));
  const processor = new StateMachineProcessor(graph, contract, bank);

  const container = await processor.execute(instructions, action);
  const finalState = getCurrentState(container);
  expect(finalState.name).toBe('complete');

  // toFiat called getSingle once for the coin -> fiat conversion
  expect(getSingleSpy).toHaveBeenCalledTimes(1);

  // payBill was called once
  expect(payBillSpy).toHaveBeenCalledTimes(1);

  // Final state: fiat and coin are zeroed out
  expect(finalState.data.coin?.isZero()).toBeTruthy();
  expect(finalState.data.fiat?.isZero()).toBeTruthy();
});

// Reverting bill payments hasn't been implemented yet.