// Initialize to release
import dotenv from 'dotenv'
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });

import { RbcApi } from '@the-coin/rbcapi';
import { initBrowser } from '@the-coin/rbcapi/action';
import { writeDataCache } from './cache';
import { fetchAllRecords } from "./fetch";

describe("Live fetch", () => {

  it("Fetches all records & caches them", async () => {
    jest.setTimeout(Number.MAX_SAFE_INTEGER);

    await initBrowser({
      headless: false
    })
    const rbcApi = new RbcApi();;
    const records = await fetchAllRecords(rbcApi);
    writeDataCache(records);
  }, 24 * 60 * 60 * 60 * 1000);
})
