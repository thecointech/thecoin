import { jest } from '@jest/globals';
import { RbcApi } from './index';
import { RbcStore } from './store';
import PouchDB from 'pouchdb';
import { ApiAction } from './action';
import { ConfigStore } from '@thecointech/store';
import { describe, IsManualRun } from '@thecointech/jestutils';
import adapter from 'pouchdb-adapter-memory';
import { closeBrowser } from './scraper';

jest.setTimeout(5*60*1000);
let api: RbcApi; // Intialized below

// Disable until we have time to figure out why this is failing
const shouldRun = IsManualRun && !!process.env.RBCAPI_CREDENTIALS_PATH && !process.env.JEST_CI;
jest.setTimeout(500000);

// This test-suite checks that using Puppeteer allows us to complete
// the requested actions.
describe('Rbc Puppeteer-based API', () => {

  beforeAll(() => {
    PouchDB.plugin(adapter);
  });

  beforeEach(initialize)
  afterEach(release)

  test("Get's stored transactions ", async () => {
    const { txs } = await RbcStore.fetchStoredTransactions();
    expect(txs.length).toBe(0);
  });

  test("Can login", async () => {
    const act = await ApiAction.New('login', true);
    expect(act.page).toBeTruthy();
  });

  test("Can fetch transactions", async () => {
      const from = new Date(2020, 1, 1);
      const to = new Date(2020, 2, 1);
      const tx = await api.getTransactions(from, to);
      expect(tx.length).toBeGreaterThan(0);
  });

  test("Get's new transactions but no more", async () => {
    const txs1 = await api.fetchLatestTransactions();
    expect(txs1.length).toBeGreaterThan(0);
    const tx2 = await api.fetchLatestTransactions();
    expect(txs1.length).toBe(tx2.length);

    const { txs, syncedTill } = await RbcStore.fetchStoredTransactions();
    expect(txs.length).toBe(txs1.length);
    expect(syncedTill.getTime() - Date.now()).toBeLessThan(48 * 60 * 60 * 1000);
  });

  test("Gets CAD transactions", async () => {
    const txscad = await api.getTransactions(new Date(2014, 5));
    expect(txscad.length).toBeGreaterThan(0);
    expect(txscad.every(tx => typeof tx.CAD === 'number')).toBeTruthy();
  });

}, shouldRun)

async function initialize() {

  RbcStore.initialize({
    adapter: "memory"
  });
  ConfigStore.initialize({
    adapter: "memory"
  })
  api = new RbcApi({ authFile: process.env.RBCAPI_CREDENTIALS_PATH! });
}

async function release() {
  RbcStore.release();
  ConfigStore.release();
  await closeBrowser();
}
