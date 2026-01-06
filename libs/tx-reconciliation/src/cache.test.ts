import { jest } from '@jest/globals';
// NOTE: Because we mock FS, we need to import
// the logging module explicitly.  It
// uses the FS module to find project root
import { log } from "@thecointech/logging";

log.level('error');

// No going to disk
const cacheName = "mocked.cache.json";
let toDisk = "";
jest.unstable_mockModule('fs', () => ({
  writeFileSync: jest.fn((_, data) => toDisk = data.toString()),
  readFileSync: jest.fn((filePath: string) => filePath.endsWith(cacheName) ? toDisk : null ),
  existsSync: jest.fn(() => toDisk != ""),
  mkdirSync: jest.fn(),
  statSync: jest.fn(() => ({ mtime: new Date() })),
}));
const cache = await import('./cache');

it("should be able to read/write the cached data", async () => {
  const emptyData = {
    bank: [],
    blockchain: [],
    dbs: {
      Bill: {},
      Buy: {},
      Sell: {},
      Plugin: {},
    },
    eTransfers: [],
    obsolete: {},
  };

  const res = cache.writeDataCache(emptyData, cacheName);
  expect(res).toBeTruthy();

  const data = cache.readDataCache(cacheName);
  expect(data).toBeTruthy();
  expect(data?.blockchain.length).toBe(0);

  const data3 = cache.readDataCache("This should not exist");
  expect(data3).toBeNull()
})
