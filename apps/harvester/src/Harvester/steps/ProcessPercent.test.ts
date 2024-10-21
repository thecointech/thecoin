import currency from 'currency.js';
import { ProcessPercent } from './ProcessPercent';
import { TransferVisaOwing } from './TransferVisaOwing';
import { PayVisa } from './PayVisa';
import { DateTime } from 'luxon';
import { Wallet } from 'ethers';
import { processState } from '../processState';


it ('correctly reduces transfer amounts', async () => {

  // Simple runnable config
  const stages = [
    new ProcessPercent({percent: 50}),
    new TransferVisaOwing(),
    new PayVisa(),
  ];
  const state = {
    chq: {
      balance: currency(500),
    },
    visa: {
      balance: currency(500),
      dueAmount: currency(200),
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
    replay: (() => Promise.resolve({ confirm: "1234" })) as any,
    creditDetails: {
      payee: 'payee',
      accountNumber: "12345"
    }
  }

  const nextState = await processState(stages, state, user);

  expect(nextState.delta.length).toEqual(stages.length);
  // 50% of 200 is 100
  expect(nextState.state.toPayVisa).toEqual(currency(100));
  // 50% of 500 is 250, minus 200 for existing balance == 50
  expect(nextState.state.toETransfer).toEqual(currency(50));
})
