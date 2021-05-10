import { createLogger, TRACE, DEBUG, WARN, stdSerializers } from 'browser-bunyan';
import { ConsoleFormattedStream } from '@browser-bunyan/console-formatted-stream';
import { BunyanLogger } from 'logger';

export function init(name: string): BunyanLogger {
  return createLogger({
    name,
    streams: [
      {
        level: process.env.NODE_ENV === "development"
          ? TRACE
          : process.env.SETTINGS === "testing"
            ? DEBUG
            : WARN,
        stream: new ConsoleFormattedStream()
      }
    ],
    serializers: stdSerializers,
  });

}
