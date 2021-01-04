import { fetchETransfers, FetchNewDepositEmails } from './index'
import { ConfigStore } from '@the-coin/store';
import { init, release } from '@the-coin/utilities/firestore/jestutils';
import { IsValidAddress } from '@the-coin/utilities';
import { describe, IsManualRun } from '@the-coin/jestutils';

jest.unmock("googleapis")
jest.unmock("auth")
jest.disableAutomock()

describe("Live service queries for gmail", () => {

  beforeAll(async () => {
    const timeout = 30 * 60 * 1000;
    jest.setTimeout(timeout);
    ConfigStore.initialize();
    await init('broker-cad');
  });

  afterAll(() => {
    ConfigStore.release();
    release();
  });

  it('Can fetch emails', async () => {

    const deposits = await FetchNewDepositEmails();
    expect(deposits).not.toBeUndefined();
  })
  it('We have valid deposits', async () => {

    if (!IsManualRun)
      return;

    const deposits = await fetchETransfers();
    expect(deposits).not.toBeUndefined();

    for (const deposit of deposits) {
      console.log(`Deposit from: ${deposit.name} - ${deposit.recieved?.toLocaleString()}`);
      expect(deposit.cad).toBeGreaterThan(0);
      expect(deposit.recieved).toBeTruthy();
      expect(IsValidAddress(deposit.address)).toBeTruthy();
      expect(deposit.depositUrl).toBeTruthy();
    }
  })


}, IsManualRun)
