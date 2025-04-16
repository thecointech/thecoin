import { waitUntilLoadComplete } from "./waitLoadComplete";
import { jest } from "@jest/globals"

jest.setTimeout(20_000);

it ("waits for load complete", async () => {
  const mockPage = {
    cbs: {} as Record<string, () => void>,
    on: (name, cb: () => void) => {
      mockPage.cbs[name] = cb;
    },
    off: (name, cb: () => void) => {
      delete mockPage.cbs[name];
    },
  }

  // Send a load event every second for 5 seconds
  let loadCount = 0;
  const loadInterval = setInterval(() => {
    mockPage.cbs["load"]?.();
    loadCount++;
    if (loadCount >= 5) {
      clearInterval(loadInterval);
    }
  }, 1000);
  let domContentLoadedCount = 0;
  const domContentLoadedInterval = setInterval(() => {
    mockPage.cbs["domcontentloaded"]?.();
    domContentLoadedCount++;
    if (domContentLoadedCount >= 3) {
      clearInterval(domContentLoadedInterval);
    }
  }, 1200);

  const start = Date.now();
  await waitUntilLoadComplete(mockPage as any);
  const end = Date.now();
  const elapsed = (end - start) / 1000;
  console.log(`Elapsed time: ${elapsed} seconds`);
  expect(elapsed).toBeGreaterThan(10);
})
