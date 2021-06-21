// reset env
process.env.CONFIG_NAME='prod';
import { getEnvFile } from "../../../tools/setenv";
import { fetchETransfers, fetchNewDepositEmails } from './index'
import { ConfigStore } from '@thecointech/store';
import { IsValidAddress } from '@thecointech/utilities';
import { describe, IsManualRun } from '@thecointech/jestutils';

jest.unmock("googleapis")
jest.unmock("auth")
jest.disableAutomock()

describe("Live service queries for gmail", () => {

  beforeAll(async () => {
    const timeout = 30 * 60 * 1000;
    jest.setTimeout(timeout);

    // Initialize config with production data
    const prodEnv = require('dotenv').config({path: getEnvFile("prod")})
    ConfigStore.initialize({
      prefix: prodEnv.parsed['STORAGE_PATH']
    });
  });

  afterAll(() => {
    ConfigStore.release();
  });

  it('Can fetch emails', async () => {

    const deposits = await fetchNewDepositEmails();
    expect(deposits).not.toBeUndefined();
  })

  it('We have valid deposits', async () => {
    const deposits = await fetchETransfers();
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
