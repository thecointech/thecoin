import type * as bunyan from "bunyan";
import { Writable } from "stream";
import { finished } from "stream/promises";

export async function endStreams(logger: bunyan): Promise<void> {
  const streams = (logger as any).streams;
  if (!streams || !Array.isArray(streams)) return;

  const pending: Promise<void>[] = [];
  for (const s of streams) {
    const stream = s.stream;
    if (!stream || typeof stream.end !== 'function') continue;

    if (stream instanceof Writable) {
      // Proper Writable streams (SeqStream, bunyan-debug-stream, etc.)
      // support _final() and emit 'finish' reliably after end()
      stream.end();
      pending.push(finished(stream).catch(err => {
        // Log but don't fail - we still want to try and flush other streams
        console.log(" ** Failed to finish stream: ", err);
      }));
    } else {
      // Non-Writable objects (e.g. bunyan RotatingFileStream) —
      // just call end() and move on, they write synchronously
      try {
        stream.end();
      }
      catch (err) {
        // Log but don't fail - we still want to try and flush other streams
        console.log(" ** Failed to end stream: ", err);
      }
    }
  }

  if (pending.length === 0) return;

  // Safety timeout: don't wait forever
  const timeout = new Promise<void>((resolve) => {
    const t = setTimeout(resolve, 10000);
    t.unref();
  });
  await Promise.race([Promise.allSettled(pending), timeout]);
}
