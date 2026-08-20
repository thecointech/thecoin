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
  let offsetPromise: Promise<number> | null = null;
  let inFlight = false;

  const refreshOffset = async (): Promise<number> => {
    inFlight = true;
    try {
      log.trace({ now: Date.now() }, "Refreshing offset");
      const serverTime = await fetchTimestamp();
      // Only record freshness once we have a successful response.
      lastOffset = serverTime - Date.now();
      lastFetchedAt = Date.now();
      return lastOffset;
    } catch (error) {
      if (lastOffset !== null) {
        // If we have succeeded in the past, use the cached offset.
        log.warn(error, "ServerTimeSource refresh failed; using stale offset");
        return lastOffset;
      } else {
        // Fallback to local time.
        log.error(error, "ServerTimeSource refresh failed; falling back to local time");
        return 0;
      }
    } finally {
      inFlight = false;
    }
  };

  return async () => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchedAt;
    if (!offsetPromise || (!inFlight && timeSinceLastFetch > offsetTtlMs)) {
      offsetPromise = refreshOffset();
    }

    // `offsetPromise` is guaranteed to be set here.
    return Date.now() + (await offsetPromise);
  };
}
