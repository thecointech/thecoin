import { jest } from '@jest/globals'
import { init } from '@thecointech/firestore';
import axios from 'axios'; // auto-mocked
import { guardFn } from './oracle';

jest.mock('@thecointech/logging')
console.log = jest.fn();
jest.useFakeTimers();
process.env['URL_SERVICE_RATES'] = 'baseurl'

const timeout = 5 * 60 * 1000;

beforeEach(() => {
  jest.clearAllMocks();
})

it ("guardFn keeps oracle alive", async () => {

  init();
  await guardFn(async () => {
    // This fn takes ...ages...
    jest.advanceTimersByTime(2.5 * timeout)
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenCalledWith('baseurl');
  })
})

it ('guardFn times out', async () => {

  init();
  await guardFn(async () => {
    // This fn takes too long
    jest.advanceTimersByTime(timeout * 24)
    // 5 min polling interval by 1 hour should be 12 calls only
    expect(axios.get).toHaveBeenCalledTimes(12);
  })
})
