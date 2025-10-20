import { jest } from '@jest/globals';
import { ConfigDatabase } from './index';
import { useMockPaths } from '../../mocked/paths';
import { ConfigShape } from './types';
import path from 'node:path';

jest.setTimeout(60000);

const { testDbPath } = useMockPaths();
const randomId = crypto.randomUUID();
const cgfData : Partial<ConfigShape> = {
  creditDetails: {
    payee: 'wallet',
    accountNumber: randomId,
  }
};

describe('config db tests', () => {
  it ('Can round-trip data', async () => {
    // Get current
    const db = newDb();
    await db.set(cgfData);
    const cfg2 = await db.get();
    expect (cfg2?.creditDetails?.accountNumber).toEqual(randomId);
  })

  it ('Can update data', async () => {
    const db = newDb();
    await db.set(cgfData);
    await db.set({
      alwaysRunScraperVisible: true,
    });
    const cfg2 = await db.get();
    expect (cfg2?.alwaysRunScraperVisible).toEqual(true);
    expect (cfg2?.creditDetails?.accountNumber).toEqual(randomId);

    for (let i = 0; i < 10; i++) {
      await db.set({
        stateKey: i.toString(),
      });
      const cfg2 = await db.get();
      expect (cfg2?.stateKey).toEqual(i.toString());
    }
  })
})

const newDb = () => new ConfigDatabase(testDbPath);
