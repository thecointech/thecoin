import { ConfigStore } from '../../store/config';
import { authorize } from './auth';

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

beforeAll(() => {
	ConfigStore.initialize();
});

afterAll(() => {
  ConfigStore.release();
});

// test("Can fetch transactions", async () => {
//     jest.setTimeout(500000);
//     const api = new RbcApi();
//     const from = new Date(202cls0, 1, 1);
//     const to = new Date(2020, 2, 1);
//     const tx = await api.getTransactions(from, to);

//     expect(tx.length).toBeGreaterThan(0);
// });

test("Can sign in", async () => {
  jest.setTimeout(500000);

  await authorize();
  console.log("Enter Code: ");
  await readline()
  // const txs1 = await api.fetchLatestTransactions();

  // expect(txs1.length).toBeGreaterThan(0);
  // const tx2 = await api.fetchLatestTransactions();
  // expect(txs1.length).toBe(tx2.length);

  // const { txs, syncedTill } = await RbcStore.fetchStoredTransactions();
  // expect(txs.length).toBe(txs1.length);
  // expect(syncedTill.getTime() - Date.now()).toBeLessThan(48 * 60 * 60 * 1000)
});
