import { log } from "@thecointech/logging";
import type { TimeSource } from "@thecointech/utilities/TimeSource";

// Re-fetch the server offset periodically to limit the impact of clock drift
// on either the client or the broker service. The timestamp is used for replay
// protection, so the offset should stay fresh relative to the server's clock.
const DEFAULT_OFFSET_TTL_MS = 5 * 60 * 1000;

export type TimestampFetcher = () => Promise<number>;

export function createServerTimeSource(
  fetchTimestamp: TimestampFetcher,
  offsetTtlMs = DEFAULT_OFFSET_TTL_MS
): TimeSource {
  let lastOffset: number | null = null;
  let lastFetchedAt = 0;
  let timeOffset: Promise<number> | null = null;

  const refreshOffset = async () : Promise<number> => {
    try {
      // Set the fetch time first, otherwise
      // concurrent fetches will think timeOffset is expired
      lastFetchedAt = Date.now();
      log.trace({now: lastFetchedAt}, "Refreshing offset");
      const serverTime = await fetchTimestamp();
      // Cache the last time
      lastOffset = serverTime - Date.now();
      return lastOffset;
    }
    catch (error) {
      // Reset the fetch time so we will retry immediately
      lastFetchedAt = 0;
      if (lastOffset !== null) {
        // If we have succeeded in the past, use the cached offset
        log.warn(error, "ServerTimeSource refresh failed; using stale offset");
        return lastOffset;
      }
      else {
        // Fallback to 0
        log.error(error, "ServerTimeSource refresh failed; falling back to local time");
        return 0;
      }
    }
  }

  return async () => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchedAt;
    if (!timeOffset || timeSinceLastFetch > offsetTtlMs) {
      timeOffset = refreshOffset();
    }

    return Date.now() + (await timeOffset);
  };


}
