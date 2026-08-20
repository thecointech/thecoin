import {
  describe,
  expect,
  it,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import type { TimestampFetcher } from "./serverTimeSource";
import { createServerTimeSource } from "./serverTimeSource";

describe("createServerTimeSource", () => {
  const baseTime = 1000000000000;
  let now = baseTime;
  let dateNowSpy: jest.SpiedFunction<typeof Date.now>;

  beforeEach(() => {
    now = baseTime;
    dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => now);
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
    jest.restoreAllMocks();
  });

  function advanceTime(ms: number) {
    now += ms;
  }

  it("fetches the server timestamp on the first call", async () => {
    const fetcher = jest.fn<TimestampFetcher>().mockResolvedValue(1000);
    const source = createServerTimeSource(fetcher);

    const result = await source();

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result).toBe(1000);
  });

  it("reuses the cached offset on subsequent calls", async () => {
    const fetcher = jest.fn<TimestampFetcher>().mockResolvedValue(1000);
    const source = createServerTimeSource(fetcher);

    const first = await source();
    const second = await source();

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });

  it("shares a single fetch across concurrent calls", async () => {
    let resolveFetch: (value: number) => void;
    const fetcher = jest.fn<TimestampFetcher>().mockImplementation(
      () => new Promise((resolve) => { resolveFetch = resolve; })
    );
    const source = createServerTimeSource(fetcher);

    const pending = Promise.all([source(), source()]);
    expect(fetcher).toHaveBeenCalledTimes(1);

    resolveFetch!(1000);
    const [first, second] = await pending;

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(first).toBe(1000);
    expect(second).toBe(1000);
  });

  it("does not treat a zero offset as uninitialized", async () => {
    const fetcher = jest.fn<TimestampFetcher>().mockResolvedValue(baseTime);
    const source = createServerTimeSource(fetcher);

    const first = await source();
    const second = await source();

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(first).toBe(baseTime);
    expect(second).toBe(baseTime);
  });

  it("refreshes the offset after the TTL expires", async () => {
    const fetcher = jest
      .fn<TimestampFetcher>()
      .mockResolvedValueOnce(1000)
      .mockResolvedValueOnce(2000);
    const source = createServerTimeSource(fetcher, 60 * 1000);

    await source();
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Advance to just before TTL expiry: should still be cached.
    advanceTime(60 * 1000);
    await source();
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Advance one ms past TTL expiry: should fetch a new offset.
    advanceTime(1);
    await source();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("retries after a failed fetch", async () => {
    const fetcher = jest
      .fn<TimestampFetcher>()
      .mockRejectedValueOnce(new Error("network failure"))
      .mockResolvedValueOnce(1000);
    const source = createServerTimeSource(fetcher);

    const first = await source();
    expect(first).toBe(baseTime);

    const result = await source();

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result).toBe(1000);
  });

  it("does not return a stale cached offset while a refresh is in flight", async () => {
    let resolveFetch: (value: number) => void;
    const fetcher = jest.fn<TimestampFetcher>().mockImplementation(
      () => new Promise((resolve) => { resolveFetch = resolve; })
    );
    const source = createServerTimeSource(fetcher, 0);

    const firstCall = source();
    resolveFetch!(1000);
    await firstCall;
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Expire TTL and start a refresh, then immediately call again.
    advanceTime(1);
    const pending = source();
    const immediate = source();

    resolveFetch!(2000);
    const [pendingResult, immediateResult] = await Promise.all([pending, immediate]);

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(pendingResult).toBe(2000);
    expect(immediateResult).toBe(2000);
  });
});
