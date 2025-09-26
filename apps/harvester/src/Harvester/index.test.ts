import { jest } from '@jest/globals';
import PouchDB from 'pouchdb';
import memory from 'pouchdb-adapter-memory'
import { Wallet } from 'ethers';
import { DateTime } from 'luxon';
import currency from 'currency.js';
import type { HarvestData } from './types';

PouchDB.plugin(memory)
jest.setTimeout(30000);

jest.unstable_mockModule('./config', () => ({
  initConfig: jest.fn(),
  hydrateProcessor: async () => {
    const { TransferVisaOwing } = await import('./steps/TransferVisaOwing');
    const { RoundUp } = await import('./steps/RoundUp');
    const { TransferLimit } = await import('./steps/TransferLimit');
    const { SendETransfer } = await import('./steps/SendETransfer');
    const { PayVisa } = await import('./steps/PayVisa');
    const { TopUp } = await import('./steps/TopUp');
    return [
      new TransferVisaOwing(),
      new RoundUp(),
      new TransferLimit({limit: 2500}),
      new TopUp(),
      new SendETransfer(),
      new PayVisa(),
    ]
  },
  getProcessConfig: jest.fn(() => {
    return {
      scraping: {
        both: {
          events: { section: "Initial", events: [{ type: 'click', id: 'credit'}] },
        },
      }
    }
  }),
  setProcessConfig: jest.fn(),
  getWallet: () => Wallet.createRandom(),
  getCreditDetails: () => ({
    payee: 'payee',
    accountNumber: "12345"
  }),
}));

it ('runs the full stack', async () => {

  const { harvest } = await import('./index');

  const r1 = await harvest();
  expect(r1).toBe(true);
  // and again
  const r2 = await harvest();
  expect(r2).toBe(true);
})


describe('shouldSkipHarvest', () => {

  const createMockHarvestData = (overrides: any = {}) => ({
    date: DateTime.now(),
    visa: {
      dueDate: DateTime.now().plus({ days: 10 }),
      balance: new currency(1000),
      dueAmount: new currency(500),
      ...overrides.visa
    },
    chq: {
      balance: new currency(2000),
      ...overrides.chq
    },
    delta: [],
    state: {
      harvesterBalance: new currency(0),
      stepData: {},
      ...overrides.state
    },
    ...overrides
  });

  let shouldSkipHarvest: (state: HarvestData) => boolean;
  beforeAll(async () => {
    shouldSkipHarvest = (await import('./index')).shouldSkipHarvest;
  })

  it('should return false when lastDueDate exists', () => {
    const mockData = createMockHarvestData({
      state: {
        harvesterBalance: new currency(0),
        stepData: { 'PayVisa': DateTime.now().toISO() }
      }
    });

    const result = shouldSkipHarvest(mockData);
    expect(result).toBe(false);
  });

  it('should return false when harvesterBalance is not zero', () => {
    const mockData = createMockHarvestData({
      state: {
        harvesterBalance: new currency(100),
        stepData: {}
      }
    });

    const result = shouldSkipHarvest(mockData);
    expect(result).toBe(false);
  });

  it('should return false when due date is more than 5 days away', () => {
    const mockData = createMockHarvestData({
      visa: {
        dueDate: DateTime.now().plus({ days: 10 })
      },
      state: {
        harvesterBalance: new currency(0),
        stepData: {}
      }
    });

    const result = shouldSkipHarvest(mockData);
    expect(result).toBe(false);
  });

  it('should return true when due date is within 5 days and conditions are met', () => {
    const mockData = createMockHarvestData({
      visa: {
        dueDate: DateTime.now().plus({ days: 3 })
      },
      state: {
        harvesterBalance: new currency(0),
        stepData: {}
      }
    });

    const result = shouldSkipHarvest(mockData);
    expect(result).toBe(true);
  });

  it('should return true when due date is today and conditions are met', () => {
    const mockData = createMockHarvestData({
      visa: {
        dueDate: DateTime.now()
      },
      state: {
        harvesterBalance: new currency(0),
        stepData: {}
      }
    });

    const result = shouldSkipHarvest(mockData);
    expect(result).toBe(true);
  });

  it('should return false when due date has passed even if conditions are met', () => {
    const mockData = createMockHarvestData({
      visa: {
        dueDate: DateTime.now().minus({ days: 1 })
      },
      state: {
        harvesterBalance: new currency(0),
        stepData: {}
      }
    });

    const result = shouldSkipHarvest(mockData);
    expect(result).toBe(false);
  });

  it('should handle edge case when due date is exactly 5 days away', () => {
    const mockData = createMockHarvestData({
      visa: {
        dueDate: DateTime.now().plus({ days: 5 })
      },
      state: {
        harvesterBalance: new currency(0),
        stepData: {}
      }
    });

    const result = shouldSkipHarvest(mockData);
    expect(result).toBe(true);
  });

  it('should return false when harvesterBalance intValue is not zero', () => {
    const mockData = createMockHarvestData({
      visa: {
        dueDate: DateTime.now().plus({ days: 3 })
      },
      state: {
        harvesterBalance: new currency(0.01), // Small amount but not zero
        stepData: {}
      }
    });

    const result = shouldSkipHarvest(mockData);
    expect(result).toBe(false);
  });
});
