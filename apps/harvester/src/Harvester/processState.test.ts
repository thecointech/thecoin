import { jest } from '@jest/globals';
import currency from 'currency.js';
import { RoundUp } from './steps/RoundUp'
import { TransferVisaOwing } from './steps/TransferVisaOwing'
import { HarvestData } from './types';
import { SendETransfer } from './steps/SendETransfer';
import { DateTime } from 'luxon';
import { Wallet } from 'ethers';
import { processState } from './processState';

jest.unstable_mockModule('./config', () => {
  return {
    getWallet: () => Wallet.createRandom(),
    getCreditDetails: () => ({
      payee: 'payee',
      accountNumber: "12345"
    })
  }
})

it ('can process on first run', async () => {

  // must happen later to allow mocking
  const { PayVisa } = await import('./steps/PayVisa');
  // Mock env vars
  process.env.WALLET_BrokerCAD_ADDRESS = "0x" + "0".repeat(40);

  // Simple runnable config
  const stages = [
    new TransferVisaOwing(),
    new RoundUp(),
    new SendETransfer(),
    new PayVisa(),
  ];
  const state: HarvestData = {
    chq: {
      balance: currency((500 + Math.random() * 1000).toFixed(2)),
    },
    visa: {
      balance: currency((Math.random() * 500).toFixed(2)),
      dueAmount: currency((Math.random() * 500).toFixed(2)),
      dueDate: DateTime.now().plus({ weeks: 1 }),
      history: [],
    },
    date: DateTime.now(),
    coinBalance: currency((Math.random() * 500).toFixed(2)),
  }

  const nextState = await processState(stages, state);

  expect(nextState.toETransfer).toBeTruthy();
})
