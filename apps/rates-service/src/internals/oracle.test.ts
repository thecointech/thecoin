import { jest } from '@jest/globals'
import { init } from '@thecointech/firestore';
import { sleep } from '@thecointech/async';
import { log } from '@thecointech/logging';
import { guardFn } from './oracle';

log.warn = jest.fn<any>();
log.error = jest.fn<any>();
jest.setTimeout(5 * 60 * 1000);

beforeEach(() => {
  jest.clearAllMocks();
})

it ("guardFn prevents simultaneous calls", async () => {
  init();

  let r1;
  const g1 = guardFn(() => new Promise((resolve) => {
    r1 = resolve;
  }))
  // Spin-lock await to allow fn to stop in above callback
  for (let i = 0; i < 100; i++) {
    if (r1) break;
    await sleep(25);
  }
  expect(r1).toBeDefined();

  // Second call should fail, first call has not completed yet
  await guardFn(() => new Promise((resolve) => {
    fail("Should not be called");
  }))
  expect(log.warn).toHaveBeenCalledWith("Cannot update Oracle - someone else holds the critical section")

  // Now complete the first call
  r1();
  await g1;

  // A 3rd call should now succeed
  let didRun = false;
  await guardFn(async () => didRun = true);
  expect(didRun).toBe(true);
})

it ("guardFn times out", async () => {
  init();
  let r1;
  const g1 = guardFn(() => new Promise((resolve) => {
    r1 = resolve;
  }))
  // Spin-lock await to allow fn to stop in above callback
  for (let i = 0; i < 100; i++) {
    if (r1) break;
    await sleep(25);
  }
  expect(r1).toBeDefined();

  jest.useFakeTimers();
  // Advance 12 hours
  jest.advanceTimersByTime(12 * 60 * 60 * 1000);
  // This call should succeed despite the timeout
  let didRun = false;
  await guardFn(async () => didRun = true);
  expect(didRun).toBe(true);
  expect(log.error).toHaveBeenCalledWith("Expired lock detected, ignoring");
  jest.useRealTimers();
})

// it ("guardFn keeps oracle alive", async () => {

//   init();
//   await guardFn(async () => {
//     // This fn takes ...ages...
//     jest.advanceTimersByTime(2.5 * timeout)
//     expect(axios.get).toHaveBeenCalledTimes(2);
//     expect(axios.get).toHaveBeenCalledWith('baseurl');
//   })
// })

// it ('guardFn times out', async () => {

//   init();
//   await guardFn(async () => {
//     // This fn takes too long
//     jest.advanceTimersByTime(timeout * 24)
//     // 5 min polling interval by 1 hour should be 12 calls only
//     expect(axios.get).toHaveBeenCalledTimes(12);
//   })
// })
