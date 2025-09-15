import { jest } from '@jest/globals';
import { ConfigDatabase } from './index';
import { useMockPaths } from '../../mocked/paths';
import { ConfigShape } from './types';

jest.setTimeout(60000);

const { testDbPath, now } = useMockPaths();
const cgfData : Partial<ConfigShape> = {
  creditDetails: {
    payee: 'wallet',
    accountNumber: now,
  }
};

describe('config db tests', () => {
  it ('Can round-trip data', async () => {
    // Get current
    const db = new ConfigDatabase(testDbPath);
    await db.set(cgfData);
    const cfg2 = await db.get();
    expect (cfg2?.creditDetails?.accountNumber).toEqual(now);
  })

  it ('Can update data', async () => {
    const db = new ConfigDatabase(testDbPath);
    await db.set(cgfData);
    await db.set({
      alwaysRunScraperVisible: true,
    });
    const cfg2 = await db.get();
    expect (cfg2?.alwaysRunScraperVisible).toEqual(true);
    expect (cfg2?.creditDetails?.accountNumber).toEqual(now);

    for (let i = 0; i < 10; i++) {
      await db.set({
        stateKey: i.toString(),
      });
      const cfg2 = await db.get();
      expect (cfg2?.stateKey).toEqual(i.toString());
    }
  })
})
