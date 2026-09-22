import { jest } from '@jest/globals';
import currency from "currency.js";
import { DateTime } from "luxon";
import { getDemoCheckpoint } from "@thecointech/scraper/testDemoAccountEmulation";
import type { HarvestData } from './types';
import type { Transaction } from '@thecointech/tx-blockchain';

const loadAndMergeHistory = jest.fn<(...args: any[]) => Promise<Transaction[]>>();
jest.unstable_mockModule('@thecointech/tx-blockchain', () => ({
  loadAndMergeHistory,
}));

const { reconcileDemoState, reconcileDemoStateIfNeeded } = await import('./initialize.prodtest');

const now = DateTime.fromISO('2024-03-20T12:00:00Z');
const address = '0x1234567890123456789012345678901234567890';
const tcCore = {} as any;
const createLastRun = (date: DateTime, state: HarvestData['state'] = {}): HarvestData => ({
  date,
  state,
} as HarvestData);
const createTransaction = (date: DateTime, change = 1): Transaction => ({
  date,
  change,
} as Transaction);

describe('reconcileDemoState', () => {
  it('restores the balance and pending payment for the latest deposit', () => {
    const checkpoint = getDemoCheckpoint(DateTime.fromISO('2024-03-17T12:00:00'));
    const reconciled = reconcileDemoState({
      harvesterBalance: currency(100),
      stepData: {
        OtherStep: 'preserved',
      },
    }, checkpoint);

    expect(reconciled.harvesterBalance).toEqual(currency(2450));
    expect(reconciled.toPayVisa).toEqual(currency(1400));
    expect(reconciled.toPayVisaDate?.toISODate()).toBe('2024-03-18');
    expect(reconciled.stepData).toEqual({
      OtherStep: 'preserved',
      PayVisa: checkpoint.visa.dueDate.toISO(),
      PayVisaAmount: '1400',
    });
  });

  it('clears a settled pending payment', () => {
    const checkpoint = getDemoCheckpoint(DateTime.fromISO('2024-03-18T12:00:00'));
    const reconciled = reconcileDemoState({
      harvesterBalance: currency(2450),
      toPayVisa: currency(1400),
      toPayVisaDate: DateTime.fromISO('2024-03-18'),
    }, checkpoint);

    expect(reconciled.harvesterBalance).toEqual(currency(1225));
    expect(reconciled.toPayVisa).toBeUndefined();
    expect(reconciled.toPayVisaDate).toBeUndefined();
  });
});

describe('reconcileDemoStateIfNeeded', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now.toJSDate());
    loadAndMergeHistory.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('trusts a recent harvester run without loading history', async () => {
    const state = { harvesterBalance: currency(100) };
    const lastRun = createLastRun(now.minus({ days: 4 }), state);

    await expect(reconcileDemoStateIfNeeded(lastRun, address, tcCore)).resolves.toBe(state);
    expect(loadAndMergeHistory).not.toHaveBeenCalled();
  });

  it('returns the last state when no deposit exists', async () => {
    const state = { harvesterBalance: currency(100) };
    const lastRun = createLastRun(now.minus({ days: 7 }), state);
    loadAndMergeHistory.mockResolvedValue([]);

    await expect(reconcileDemoStateIfNeeded(lastRun, address, tcCore)).resolves.toBe(state);
  });

  it('reconciles a stale run to a recent deposit', async () => {
    const lastRun = createLastRun(now.minus({ days: 7 }), {
      harvesterBalance: currency(100),
    });
    const depositDate = now.minus({ days: 3 });
    loadAndMergeHistory.mockResolvedValue([
      createTransaction(now.minus({ days: 2 }), -100),
      createTransaction(depositDate),
    ]);

    const reconciled = await reconcileDemoStateIfNeeded(lastRun, address, tcCore);
    const checkpoint = getDemoCheckpoint(depositDate);

    expect(reconciled.harvesterBalance).toEqual(checkpoint.visa.balance);
    expect(reconciled.toPayVisa).toEqual(checkpoint.pendingPayment?.amount);
  });

  it('reconciles the first run when a recent deposit exists', async () => {
    const depositDate = now.minus({ days: 3 });
    loadAndMergeHistory.mockResolvedValue([createTransaction(depositDate)]);

    const reconciled = await reconcileDemoStateIfNeeded(undefined, address, tcCore);

    expect(reconciled.harvesterBalance).toEqual(getDemoCheckpoint(depositDate).visa.balance);
  });

  it('rejects reconciliation when the latest deposit is too old', async () => {
    const lastRun = createLastRun(now.minus({ days: 10 }));
    loadAndMergeHistory.mockResolvedValue([
      createTransaction(now.minus({ days: 9 })),
    ]);

    await expect(reconcileDemoStateIfNeeded(lastRun, address, tcCore))
      .rejects.toThrow('Harvester is too far out-of-date');
  });
});
