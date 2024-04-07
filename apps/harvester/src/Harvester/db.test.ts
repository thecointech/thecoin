import { jest } from '@jest/globals';
import { DateTime } from 'luxon'
import { HarvestData } from './types'
import currency from 'currency.js'
import { getCurrentState, setOverrides, setCurrentState } from './db'
import memory from 'pouchdb-adapter-memory'
import PouchDB from 'pouchdb';
import { fromDb, toDb } from './db_translate';
import { PayVisa } from './steps/PayVisa';
import { ClearPendingVisa } from './steps/ClearPendingVisa';
import { TransferVisaOwing } from './steps/TransferVisaOwing';

PouchDB.plugin(memory)
jest.setTimeout(30000);

it ('can convert to/from db', () => {
  const converted = toDb(sample);
  const roundtrip = fromDb(converted);
  expect(roundtrip).toEqual(sample);
})

it ('can roundtrip in the db', async () => {
  await setCurrentState(sample);
  const last = await getCurrentState();
  expect(last).toEqual(sample);
})

it ('can override balance', async () => {
  const now = DateTime.now();
  await setOverrides(124.23, 1400, now.toISO());
  const r = await getCurrentState();
  expect(r!.state.harvesterBalance?.value).toEqual(124.23);
  expect(r!.state.toPayVisa?.value).toEqual(1400);
  expect(r!.state.toPayVisaDate).toEqual(now);

  // Check that Transfer recognizes the override
  r!.visa.balance = new currency(300);
  const xferDelta = await new TransferVisaOwing().process(r!);
  expect(xferDelta.toETransfer).toEqual(new currency(300 - 124.23));

  // Check that PayVisa recognizes the override
  const payDelta = await new PayVisa().process(r!, {} as any);
  expect(payDelta).toEqual({});

  // Check that ClearVisa recognizes the override
  r?.visa.history.push({
    date: now,
    description: 'asdf',
    credit: new currency(1400),
    balance: new currency(1400),
  })
  const clearDelta = await new ClearPendingVisa().process(r!);
  expect(clearDelta.toPayVisa).toBeUndefined();
  expect(clearDelta.toPayVisaDate).toBeUndefined();
})

const sample: HarvestData = {
  date: DateTime.now(),
  visa: {
    balance: new currency(100),
    dueDate: DateTime.now(),
    dueAmount: new currency(100),
    history: [
      {
        date: DateTime.now(),
        description: 'asdf',
        credit: new currency(100),
        balance: new currency(100),
      },
      {
        date: DateTime.now(),
        description: 'asdf',
        debit: new currency(100),
        balance: new currency(100),
      }
    ],
  },
  chq: {
    balance: new currency(100),
  },
  delta: [
    {
      harvesterBalance: new currency(100),
      toETransfer: new currency(100),
      toPayVisa: new currency(100),
      toPayVisaDate: DateTime.now(),
      stepData: {
        RoundUp: "123.23",
      }
    },
    {
      harvesterBalance: new currency(100),
      toETransfer: new currency(100),
      toPayVisa: new currency(100),
    }
  ],
  state: {
    harvesterBalance: new currency(100),
    toETransfer: new currency(100),
    toPayVisa: new currency(100),
    stepData: {
      RoundUp: "123.23",
    }
  }
}
