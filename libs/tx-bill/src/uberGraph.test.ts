import { jest } from "@jest/globals";
import { init } from '@thecointech/firestore';
import { rawGraph } from './uberGraph';
import { DateTime } from 'luxon';
import { getMockContainer } from "../internal/mockContainer";

jest.setTimeout(10 * 60 * 60 * 1000);
jest.useFakeTimers();

it('processes pending', async () => {
  init()
  const date = DateTime.now();
  const container = await getMockContainer(date);
  container.instructions = {} as any; // bypass encryption
  let state = container.history[0];

  const incrementState = async () => {
    const { action, next } = rawGraph[state!.name]
    const r = await action(container);
    if (!r) return;

    if (r?.error) throw r.error;
    const delta = {
      created: DateTime.now(),
      type: action.transitionName,
      ...r,
    }
    const newState = {
      delta,
      data: {
        ...state.data,
        ...delta,
      },
      name: next
    }
    container.history.push(newState);
    state = newState;
  }

  // First transfer doesn't actually do any transfers, so no logs
  // const provider = container.contract.runner.provider
  // const oldWait = provider.waitForTransaction
  // //@ts-ignore
  // provider.waitForTransaction = jest.fn(() => Promise.resolve({
  //   confirmations: 3,
  //   status: 1,
  //   logs: [],
  // }));

  // Register pending transaction
  expect(state.name).toBe("initial");
  await incrementState();
  expect(state.name).toBe("tcRegisterReady");
  await incrementState();
  expect(state.name).toBe("tcRegisterWaiting");
  await incrementState();
  expect(state.name).toBe("tcWaitToFinalize");
  expect(state?.delta.coin).toBeFalsy();
  expect(state?.delta.fiat).toBeFalsy();

  // Wait for the timestamp to pass
  await incrementState();
  expect(state.name).toBe("tcWaitToFinalize");
  // Still waiting - run again, same result
  await incrementState();
  expect(state.name).toBe("tcWaitToFinalize");

  // Wait a day, run again.  This time we clear the pending transfer
  // provider.waitForTransaction = oldWait;
  jest.setSystemTime(date.plus({ days: 1 }).toJSDate());
  await incrementState();
  expect(state.name).toBe("tcFinalizeInitial");

  await incrementState();
  expect(state.name).toBe("tcFinalizeReady");
  await incrementState();
  expect(state.name).toBe("tcFinalizeWaiting");
  jest.useRealTimers();
  // jest.setSystemTime(date.plus({ days: 2 }).toJSDate());
  await incrementState();
  expect(state.name).toBe("coinTransferComplete");
  expect(state?.delta.coin).toBeDefined();
  expect(state?.delta.fiat).toBeUndefined();

  // Run currency conversion
  // Just in case you're working late into the night... let's wait for the next day
  jest.useFakeTimers();
  jest.setSystemTime(date.plus({ days: 2 }).set({hour: 12}).toJSDate());
  await incrementState();
  expect(state.name).toBe("billInitial");
  expect(state?.delta.coin?.toNumber()).toBe(0);
  expect(state?.delta.fiat?.toNumber()).toBeGreaterThan(0);

  // We have fiat, complete bill payment
  await incrementState();
  expect(state.name).toBe("billReady");
  await incrementState();
  expect(state.name).toBe("billResult");
  expect(state?.delta.fiat?.toNumber()).toBe(0);

  // All done
  await incrementState();
  expect(state.name).toBe("complete");
})

