import { jest } from '@jest/globals';
import currency from 'currency.js';
import { TopUp } from './TopUp'
import { SendETransfer } from './SendETransfer';
import { processState } from '../processState';
import { DateTime } from 'luxon';

jest.useFakeTimers();

it ('Tops up appropriately', async () => {
  const stages = [
    new TopUp({
      topUp: 10
    }),
    new SendETransfer(),
  ];

  const getState = (toETransfer?: currency, priorState?: any) : any => ({
    chq: {
      balance: currency(500),
    },
    delta: [],
    state: {
      toETransfer,
      stepData: priorState?.state.stepData,
    },
  })

  // First run, it should do nothing
  const state1 = await processState(stages, getState());
  expect(state1.delta[0]).toEqual({});

  // Now, a transfer is scheduled
  const state2 = await processState(stages, getState(currency(100), state1));
  expect(state2.delta[0].toETransfer).toEqual(currency(110));
  expect(state2.state.toETransfer).toBeUndefined();
  expect(state2.state.harvesterBalance).toEqual(currency(100));

  // Run again immediately, no additional transfer is made
  const state3 = await processState(stages, getState(currency(100), state2));
  expect(state3.delta[0]).toEqual({});

  // A month has passed, another top up is due
  jest.setSystemTime(DateTime.now().plus({ months: 1, days: 1 }).toJSDate());
  const state4 = await processState(stages, getState(currency(100), state3));
  expect(state4.delta[0].toETransfer).toEqual(currency(110));
  expect(state2.state.harvesterBalance).toEqual(currency(100));
})
