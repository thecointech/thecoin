import { RbcApi } from './index';
import { RbcStore } from './store';
import PouchDB from 'pouchdb';
import { initBrowser } from './action';
import { ConfigStore } from '../store';

beforeAll(() => {
  PouchDB.plugin(require('pouchdb-adapter-memory'));

  RbcStore.initialize({
    adapter: "memory"
  });
  ConfigStore.initialize({
    adapter: "memory"
  })
  jest.setTimeout(500000);
});

afterAll(() => {
  RbcStore.release();
  ConfigStore.release();
});


// This test-suite checks that using Puppeteer allows us to complete
// the requested actions.
describe('Rbc Puppeteer-based API', () => {

  // test("Can fetch transactions", async () => {
  //     jest.setTimeout(500000);
  //     const api = new RbcApi();
  //     const from = new Date(202cls0, 1, 1);
  //     const to = new Date(2020, 2, 1);
  //     const tx = await api.getTransactions(from, to);

  //     expect(tx.length).toBeGreaterThan(0);
  // });

  test("Get's stored transactions ", async () => {
    const { txs } = await RbcStore.fetchStoredTransactions();
    expect(txs.length).toBe(0);
  });

  test("Get's new transactions but no more", async () => {

    await initBrowser({
      //headless: false
    })

    const api = new RbcApi();
    const txs1 = await api.fetchLatestTransactions();

    expect(txs1.length).toBeGreaterThan(0);
    const tx2 = await api.fetchLatestTransactions();
    expect(txs1.length).toBe(tx2.length);

    const { txs, syncedTill } = await RbcStore.fetchStoredTransactions();
    expect(txs.length).toBe(txs1.length);
    expect(syncedTill.getTime() - Date.now()).toBeLessThan(48 * 60 * 60 * 1000)
  });
})

