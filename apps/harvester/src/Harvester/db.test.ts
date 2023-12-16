import { jest } from '@jest/globals';
import { DateTime } from 'luxon'
import { HarvestData } from './types'
import currency from 'currency.js'
import { getCurrentState, setCurrentState } from './db'
import memory from 'pouchdb-adapter-memory'
import PouchDB from 'pouchdb';
import { fromDb, toDb } from './db_translate';

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
