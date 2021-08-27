// reset env
process.env.CONFIG_NAME='prod';
import { getEnvVars } from "../../../tools/setenv";
import { queryETransfers, queryNewDepositEmails } from './query'
import { ConfigStore } from '@thecointech/store';
import { IsValidAddress } from '@thecointech/utilities';
import { describe, IsManualRun } from '@thecointech/jestutils';

jest.unmock("googleapis")
jest.disableAutomock()

describe("Live service queries for gmail", () => {

  beforeAll(async () => {
    const timeout = 30 * 60 * 1000;
    jest.setTimeout(timeout);

    // Initialize config with production data
    const prodEnv = getEnvVars('prod');
    ConfigStore.initialize({
      prefix: prodEnv['STORAGE_PATH']
    });
  });

  afterAll(() => {
    ConfigStore.release();
  });

  it('Can query emails', async () => {

    const deposits = await queryNewDepositEmails();
    expect(deposits).not.toBeUndefined();
  })

  it('We have valid deposits', async () => {
    const deposits = await queryETransfers();
    expect(deposits).not.toBeUndefined();

    for (const deposit of deposits) {
      console.log(`Deposit from: ${deposit.name} - ${deposit.recieved?.toLocaleString()}`);
      expect(deposit.cad.gt(0)).toBeTruthy();
      expect(deposit.recieved).toBeTruthy();
      expect(IsValidAddress(deposit.address)).toBeTruthy();
      expect(deposit.depositUrl).toBeTruthy();
    }
  })


}, IsManualRun)
