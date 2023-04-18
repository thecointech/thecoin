import currency from 'currency.js';
import { RoundUp } from './steps/RoundUp'
import { TransferVisaOwing } from './steps/TransferVisaOwing'
import { HarvestData } from './types';
import { SendETransfer } from './steps/SendETransfer';
import { PayVisa } from './steps/PayVisa';
import { DateTime } from 'luxon';
import { processState } from '.';


it ('can process on first run', async () => {

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

  expect(nextState.toCoin).toBeTruthy();
})
