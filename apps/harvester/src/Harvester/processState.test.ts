import currency from 'currency.js';
import { RoundUp } from './steps/RoundUp'
import { TransferVisaOwing } from './steps/TransferVisaOwing'
import { SendETransfer } from './steps/SendETransfer';
import { DateTime } from 'luxon';
import { Wallet } from 'ethers';
import { processState } from './processState';
import { PayVisa } from './steps/PayVisa';
import { ClearPendingVisa } from './steps/ClearPendingVisa';
import { TransferLimit } from './steps/TransferLimit';
import { EnsureHarvesterBalance } from './steps/EnsureHarvesterBalance';
import { HarvestData } from './types';

it ('can process on first run', async () => {

  const state: HarvestData = getData();
  const nextState = await processState(stages, state, user);

  expect(nextState.delta.length).toEqual(stages.length);
  // harvester balance should exceed visa balance
  expect(nextState.state.harvesterBalance).toEqual(currency(350));
  expect(nextState.state.toPayVisa).toEqual(currency(100));
  expect(nextState.state.toETransfer).toBeUndefined();
})

it ("correctly handles a negative due amount", async () => {
  let state: HarvestData = getData();
  // No money sent on negative due amount
  state.visa.dueAmount = currency(-100);
  const nextState = await processState(stages, state, user);
  expect(nextState.state.toPayVisa).toEqual(currency(0));

  // Pending is still cleared
  nextState.date = nextState.visa.dueDate.plus({ days: 1 });
  const finalState = await processState(stages, nextState, user);
  expect(finalState.state.toPayVisa).toBeUndefined();
  expect(finalState.state.toPayVisaDate).toBeUndefined();
  expect(finalState.state.harvesterBalance).toEqual(currency(350));
})

const getData = () : HarvestData => ({
  chq: {
    balance: currency(500),
  },
  visa: {
    balance: currency(325),
    dueAmount: currency(100),
    dueDate: DateTime.now().plus({ weeks: 1 }),
  },
  date: DateTime.now(),

  state: {
    harvesterBalance: currency(200),
  },
  delta: []
})


// Simple runnable config
const stages = [
  new ClearPendingVisa(),
  new EnsureHarvesterBalance(),
  new TransferVisaOwing(),
  new RoundUp(),
  new TransferLimit({limit: 150}),
  new SendETransfer(),
  new PayVisa(),
];
const user = {
  wallet: Wallet.createRandom(),
  creditDetails: {
    payee: 'payee',
    accountNumber: "12345"
  }
}
