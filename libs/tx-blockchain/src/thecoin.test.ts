import { jest } from '@jest/globals';
import { fetchCoinHistory } from "./thecoin";
import { describe, IsManualRun } from '@thecointech/jestutils';
import { initAllAddresses } from './setup.test';

//
// Easy-to-debug fetch of all history
describe("Fetch live data", () => {

  beforeAll(initAllAddresses);

  it('Can fetch TheCoin history', async () => {
    jest.setTimeout(10 * 60 * 1000); // 10 mins to process this (todo: cache the data)
    process.env.CONFIG_NAME='prod';
    const history = await fetchCoinHistory();

    expect(history.length).toEqual(20);
  })
}, IsManualRun);
