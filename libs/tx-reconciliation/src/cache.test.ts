import { readDataCache, writeDataCache } from './cache';
import fs from 'fs';
// No going to disk
jest.mock('fs');
const mockedFs = jest.mocked(fs);

it("should be able to read/write the cached data", async () => {
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

  let toDisk = "";
  mockedFs.writeFileSync.mockImplementation((_, data) => toDisk = data.toString());
  const res = writeDataCache(emptyData, "mocked.cache.json");
  expect(res).toBeTruthy();

  mockedFs.readFileSync.mockReturnValue(toDisk);
  mockedFs.existsSync.mockReturnValueOnce(true);
  const data = readDataCache("mocked.cache.json");
  expect(data).toBeTruthy();
  expect(data?.blockchain.length).toBe(0);

  const data3 = readDataCache("This should not exist");
  expect(data3).toBeNull()
})
