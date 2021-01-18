import { readCache, writeCache } from './cache';


it("should be able to read/write the cached data", () => {
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

  const res = writeCache(emptyData, "mocked.cache.json");

  expect(res).toBeTruthy();

  const data = readCache("mocked.cache.json");
  expect(data).toBeTruthy();
  expect(data?.blockchain.length).toBe(0);

  readCache();

  const data3 = readCache("This should not exist");
  expect(data3).toBeNull()

})
