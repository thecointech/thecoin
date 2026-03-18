import { Writable } from 'stream';
import bunyan from 'bunyan';
import { endStreams } from './endStreams';

it('resolves after all streams end', async () => {
  let endCalled = false;

  const testStream = new Writable({
    write(_chunk, _encoding, callback) { callback(); },
    final(callback) {
      endCalled = true;
      callback();
    }
  });

  const logger = bunyan.createLogger({
    name: 'flush-test',
    streams: [{ stream: testStream, level: 'info' }],
  });

  logger.info('before flush');
  await endStreams(logger);
  expect(endCalled).toBe(true);
});

it('resolves immediately when no streams have end()', async () => {
  // A minimal stream-like object with write() but no end()
  const noEndStream = { write: () => {} };
  const logger = bunyan.createLogger({
    name: 'flush-noop-test',
    streams: [{ stream: noEndStream as any, level: 'info', type: 'raw' }],
  });

  const start = Date.now();
  await endStreams(logger);
  const elapsed = Date.now() - start;

  expect(elapsed).toBeLessThan(1000);
});

it('resolves immediately for a logger with no streams', async () => {
  // Simulate a logger with no streams array
  const fakeLogger = {} as any;
  await expect(endStreams(fakeLogger)).resolves.toBeUndefined();
});

it('waits for _final on Writable streams (e.g. SeqStream)', async () => {
  // Simulate SeqStream: a Writable with an async _final that flushes
  let flushed = false;
  const seqLikeStream = new Writable({
    objectMode: true,
    write(_chunk, _encoding, callback) { callback(); },
    final(callback) {
      // Simulate an async flush (e.g. seq logger.close())
      setTimeout(() => {
        flushed = true;
        callback();
      }, 50);
    },
  });

  const logger = bunyan.createLogger({
    name: 'seq-like-test',
    streams: [{ stream: seqLikeStream, level: 'info', type: 'raw' }],
  });

  await endStreams(logger);
  expect(flushed).toBe(true);
}, 3000);

it('awaits inner Writable on non-Writable wrappers (e.g. RotatingFileStream)', async () => {
  // Simulate bunyan RotatingFileStream: a non-Writable object whose
  // end() delegates to an inner .stream that is a proper Writable
  let innerFlushed = false;
  const innerStream = new Writable({
    write(_chunk, _encoding, callback) { callback(); },
    final(callback) {
      setTimeout(() => {
        innerFlushed = true;
        callback();
      }, 50);
    },
  });

  const rotatingLike = {
    end() { innerStream.end(); },
    stream: innerStream,
  };

  const logger = bunyan.createLogger({
    name: 'rotating-like-test',
    streams: [{ stream: rotatingLike as any, level: 'info', type: 'raw' }],
  });

  await endStreams(logger);
  expect(innerFlushed).toBe(true);
}, 3000);
