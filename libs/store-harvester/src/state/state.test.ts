import { jest } from '@jest/globals';
import { DateTime } from 'luxon'
import { HarvestData } from './types.harvest'
import currency from 'currency.js'
import memory from 'pouchdb-adapter-memory'
import PouchDB from 'pouchdb';
import { fromDb, toDb } from './transform';
import { StateDatabase } from './index';
import { useMockPaths } from '../../mocked/paths';

PouchDB.plugin(memory)
jest.setTimeout(30000);
const { testDbPath } = useMockPaths();

describe('state db tests', () => {
  it ('can convert to/from db', () => {
    const sample = getSample();
    const converted = toDb(sample);
    const roundtrip = fromDb(converted);
    expect(roundtrip).toEqual(sample);
  })

  it ('can roundtrip in the db', async () => {
    const db = new StateDatabase(testDbPath);
    const sample = getSample();
    await db.set(sample);
    const last = await db.get();
    expect(last).toEqual(sample);
  })

  it ('can get past states', async () => {
    const db = new StateDatabase(testDbPath);
    const samples = Array.from({ length: 5 }, (_, i) => getSample(DateTime.now().plus({ days: i })));
    for (const sample of samples) {
      await db.set(sample);
    }
    const last = await db.getAll();
    last.reverse();
    expect(last).toHaveLength(samples.length);
    expect(last).toEqual(samples);
  })
})


const getSample = (date?: DateTime): HarvestData => ({
  date: date ?? DateTime.now(),
  visa: {
    balance: new currency(100),
    dueDate: DateTime.now(),
    dueAmount: new currency(100),
  },
  chq: {
    balance: new currency(100),
  },
  coin: BigInt(100*1e6),
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
})
