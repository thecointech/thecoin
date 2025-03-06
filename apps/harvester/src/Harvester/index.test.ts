import { jest } from '@jest/globals';
import PouchDB from 'pouchdb';
import memory from 'pouchdb-adapter-memory'
import { Wallet } from 'ethers';

PouchDB.plugin(memory)
jest.setTimeout(30000);

jest.unstable_mockModule('./config', () => ({
  initConfig: jest.fn(),
  hydrateProcessor: async () => {
    const { TransferVisaOwing } = await import('./steps/TransferVisaOwing');
    const { RoundUp } = await import('./steps/RoundUp');
    const { TransferLimit } = await import('./steps/TransferLimit');
    const { SendETransfer } = await import('./steps/SendETransfer');
    const { PayVisa } = await import('./steps/PayVisa');
    const { TopUp } = await import('./steps/TopUp');
    return [
      new TransferVisaOwing(),
      new RoundUp(),
      new TransferLimit({limit: 2500}),
      new TopUp(),
      new SendETransfer(),
      new PayVisa(),
    ]
  },
  getProcessConfig: jest.fn(() => {
    return {
      scraping: {
        both: { section: "Initial", events: [{ type: 'click', id: 'credit'}] },
      }
    }
  }),
  setProcessConfig: jest.fn(),
  getWallet: () => Wallet.createRandom(),
  getCreditDetails: () => ({
    payee: 'payee',
    accountNumber: "12345"
  }),
}));

it ('runs the full stack', async () => {

  const { harvest } = await import('./index');

  const r1 = await harvest();
  expect(r1).toBe(true);
  // and again
  const r2 = await harvest();
  expect(r2).toBe(true);
})
