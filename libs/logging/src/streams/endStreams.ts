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

    // Find the Writable to await: the stream itself, or its inner
    // .stream (e.g. bunyan RotatingFileStream wraps an fs.WriteStream)
    const writable = stream instanceof Writable ? stream
      : (stream.stream instanceof Writable ? stream.stream : null);

    try {
      stream.end();
      if (writable) {
        pending.push(finished(writable).catch(err => {
          console.log(" ** Failed to finish stream: ", err);
        }));
      }
    }
    catch (err) {
      console.log(" ** Failed to end stream: ", err);
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
