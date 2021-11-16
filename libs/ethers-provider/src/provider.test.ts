process.env.CONFIG_NAME="prodtest"
jest.unmock('@thecointech/contract-core')
import { ChainProvider } from './provider';
import * as cc from '@thecointech/contract-core';

jest.setTimeout(60000)
jest.unmock('@thecointech/contract-core')

it ('fetches ERC20 txs', async () => {
  const provider = new ChainProvider('mumbai');
  // const  h1 = await provider.getHistory('3043a245dc9f1a9574635e7ff1dea6ccffab8b92');

  const history = await provider.getERC20History('123b38e9a9b3f75a8e16a4987eb5d7a524da6e56');
  expect(history.length).toBeGreaterThan(0);
})

it ('fetches custom logs', async () => {
  const provider = new ChainProvider('mumbai');
  // const  h1 = await provider.getHistory('3043a245dc9f1a9574635e7ff1dea6ccffab8b92');
  const contract = cc.GetContract();

  const filter = contract.filters.ExactTransfer();
  (filter as any).fromBlock = 200000;
  const logs = await provider.getLogs(filter);
  for (const log of logs) {
    const data = contract.interface.parseLog(log);
    console.log(data);
  }
  expect(history.length).toBeGreaterThan(0);
})
