import { readDataCache, writeDataCache } from './cache';
import { init } from '@thecointech/utilities/firestore';


it("should be able to read/write the cached data", async () => {
  await init();
  const emptyData = {
    bank: [],
    blockchain: [],
    dbs: {
      Bill: {},
      Buy: {},
      Sell: {},
    },
    eTransfers: [],
    obsolete: {},
  };

  const res = writeDataCache(emptyData, "mocked.cache.json");

  expect(res).toBeTruthy();

  const data = readDataCache("mocked.cache.json");
  expect(data).toBeTruthy();
  expect(data?.blockchain.length).toBe(0);

  // Read any existing cache
  readDataCache();

  const data3 = readDataCache("This should not exist");
  expect(data3).toBeNull()

})
