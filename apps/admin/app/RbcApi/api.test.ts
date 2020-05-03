import {RbcApi} from './index';
import { fetchStoredTransactions } from './RbcStore';

test("Can fetch transactions", async () => {
    jest.setTimeout(500000);
    const api = new RbcApi();
    const from = new Date(2020, 1, 1);
    const to = new Date(2020, 2, 1);
    const tx = await api.getTransactions(from, to);

    expect(tx.length).toBeGreaterThan(0);
});

test("Get's new transactions but no more", async () => {
  jest.setTimeout(500000);

  const api = new RbcApi();
  const txs = await api.fetchLatestTransactions();

  expect(txs.length).toBeGreaterThan(0);
  const tx2 = await api.fetchLatestTransactions();
  expect(txs.length).toBe(tx2.length);

  const tx3 = await fetchStoredTransactions();
  expect(txs.length).toBe(tx3.length);
});
