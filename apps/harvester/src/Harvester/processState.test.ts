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
      balance: currency(500),
    },
    visa: {
      balance: currency(325),
      dueAmount: currency(100),
      dueDate: DateTime.now().plus({ weeks: 1 }),
      history: [],
    },
    date: DateTime.now(),

    state: {
      harvesterBalance: currency(200),
    },
    delta: []
  }

  const nextState = await processState(stages, state);

  expect(nextState.delta.length).toEqual(4);
  // money to be etransfered should be gone
  expect(nextState.state.harvesterBalance).toEqual(currency(500));
  expect(nextState.state.toPayVisa).toEqual(currency(100));
  expect(nextState.state.toETransfer).toBeUndefined();
})
