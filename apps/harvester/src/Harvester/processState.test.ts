import currency from 'currency.js';
import { RoundUp } from './steps/RoundUp'
import { TransferVisaOwing } from './steps/TransferVisaOwing'
import { HarvestData, Replay } from './types';
import { SendETransfer } from './steps/SendETransfer';
import { DateTime } from 'luxon';
import { Wallet } from 'ethers';
import { processState } from './processState';
import { PayVisa } from './steps/PayVisa';
import { ClearPendingVisa } from './steps/ClearPendingVisa';

it ('can process on first run', async () => {

  // Simple runnable config
  const stages = [
    new ClearPendingVisa(),
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
  const user = {
    wallet: Wallet.createRandom(),
    replay: (() => Promise.resolve({ confirm: "1234" })) as any as Replay,
    creditDetails: {
      payee: 'payee',
      accountNumber: "12345"
    }
  }

  const nextState = await processState(stages, state, user);

  expect(nextState.delta.length).toEqual(5);
  // harvester balance should exceed visa balance
  expect(nextState.state.harvesterBalance).toEqual(currency(400));
  expect(nextState.state.toPayVisa).toEqual(currency(100));
  expect(nextState.state.toETransfer).toBeUndefined();
})
