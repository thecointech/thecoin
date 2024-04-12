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
    const { SendETransfer } = await import('./steps/SendETransfer');
    const { PayVisa } = await import('./steps/PayVisa');
    const { TopUp } = await import('./steps/TopUp');
    return [
      new TransferVisaOwing(),
      new RoundUp(),
      new TopUp(),
      new SendETransfer(),
      new PayVisa(),
    ]
  },
  getWallet: () => Wallet.createRandom(),
  getCreditDetails: () => ({
    payee: 'payee',
    accountNumber: "12345"
  }),
  getEvents: () => [],
}));

it ('runs the full stack', async () => {

  const { harvest } = await import('./index');

  await harvest();
  // and again
  await harvest();
  // and again
})
