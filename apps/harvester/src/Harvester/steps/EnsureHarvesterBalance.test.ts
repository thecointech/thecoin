import { jest } from '@jest/globals'
import { HarvestData } from '../types';
import currency from 'currency.js';
import { DateTime } from 'luxon';
import { processState } from '../processState';
import { mockUser } from '../../../internal/mockUser';

jest.unstable_mockModule('../notify', () => ({
  notify: jest.fn(),
}));
jest.unstable_mockModule('./utils', () => ({
  getBalance: jest.fn(),
}))

const notify = await import('../notify');
const utils = await import('./utils');
const { EnsureHarvesterBalance } = await import('./EnsureHarvesterBalance')
const { ClearPendingVisa } = await import('./ClearPendingVisa')

const mockNotify = notify.notify as jest.Mock<typeof notify.notify>;
const mockGetBalance = utils.getBalance as jest.Mock<typeof utils.getBalance>;

describe('EnsureHarvesterBalance', () => {

  const testDate = DateTime.fromISO('2025-02-25T22:06:30-06:00');

  const createTestData = (harvesterBalance?: currency): HarvestData => ({
    date: testDate,
    visa: {} as any,
    chq: {} as any,
    coin: BigInt(100*1e6),
    delta: [],
    state: {
      harvesterBalance
    }
  });

  const testUser = mockUser();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty object when no harvesterBalance in state', async () => {
    const stage = new EnsureHarvesterBalance();
    const result = await stage.process(createTestData(), testUser);
    expect(result).toEqual({});
    expect(mockGetBalance).not.toHaveBeenCalled();
  });

  it('should return empty object when current balance matches expected', async () => {
    const expectedBalance = currency('100');
    mockGetBalance.mockResolvedValue(expectedBalance.value);

    const stage = new EnsureHarvesterBalance();
    const result = await stage.process(createTestData(expectedBalance), testUser);

    expect(result).toEqual({});
    expect(mockGetBalance).toHaveBeenCalledWith(testUser);
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it('should return empty object when current balance is higher than expected', async () => {
    const expectedBalance = currency('100');
    mockGetBalance.mockResolvedValue(150);

    const stage = new EnsureHarvesterBalance();
    const result = await stage.process(createTestData(expectedBalance), testUser);

    expect(result).toEqual({});
    expect(mockGetBalance).toHaveBeenCalledWith(testUser);
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it('should notify and reset balance when current balance is lower than expected', async () => {
    const expectedBalance = currency('150');
    const currentBalance = currency('100');
    mockGetBalance.mockResolvedValue(currentBalance.value);

    const stage = new EnsureHarvesterBalance();
    const result = await stage.process(createTestData(expectedBalance), testUser);

    expect(result).toEqual({
      harvesterBalance: currentBalance
    });
    expect(mockGetBalance).toHaveBeenCalledWith(testUser);
    expect(mockNotify).toHaveBeenCalled();
  });

  it('should return empty object when getBalance returns undefined', async () => {
    const expectedBalance = currency('100');
    mockGetBalance.mockResolvedValue(undefined);

    const stage = new EnsureHarvesterBalance();
    const result = await stage.process(createTestData(expectedBalance), testUser);

    expect(result).toEqual({});
    expect(mockGetBalance).toHaveBeenCalledWith(testUser);
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it ('correctly adjusts balance when visa is due but has future date', async () => {
    const stages = [
      new ClearPendingVisa(),
      new EnsureHarvesterBalance(),
    ]

    const state = {
      date: DateTime.now(),
      state: {
        harvesterBalance: currency(200),
        toPayVisa: currency(100),
        // Not yet settled
        toPayVisaDate: DateTime.now().minus({ days: 1 }),
      },
      visa: {},
      delta: []
    } as HarvestData;
    const user = {} as any
    mockGetBalance.mockResolvedValue(50);
    const r = await processState(stages, state, user)

    // harvester balance should exceed visa balance
    expect(r.state.harvesterBalance).toEqual(currency(150));
    // No change in visa due
    expect(r.state.toPayVisa).toEqual(currency(100));
    expect(r.state.toETransfer).toBeUndefined();
  })

  it ('correctly adjusts balance visa is due and has past date', async () => {
    const stages = [
      new ClearPendingVisa(),
      new EnsureHarvesterBalance(),
    ]

    const state = {
      date: DateTime.now(),
      state: {
        harvesterBalance: currency(200),
        toPayVisa: currency(100),
        // Not yet settled
        toPayVisaDate: DateTime.now().minus({ weeks: 1 }),
      },
      visa: {},
      delta: []
    } as HarvestData;
    const user = {} as any
    mockGetBalance.mockResolvedValue(50);
    const r = await processState(stages, state, user)

    // harvester balance should exceed visa balance
    expect(r.state.harvesterBalance).toEqual(currency(50));
    expect(r.state.toPayVisa).toBeUndefined();
  })


});
