import { createLogger, TRACE, INFO, DEBUG, stdSerializers } from 'browser-bunyan';
import { ConsoleFormattedStream } from '@browser-bunyan/console-formatted-stream';
import { BunyanLogger } from './logger';

export function init_browser(name: string): BunyanLogger {
  return createLogger({
    name,
    streams: [
      {
        level: process.env.NODE_ENV === "development"
          ? TRACE
          : process.env.SETTINGS === "testing"
            ? DEBUG
            : INFO,
        stream: new ConsoleFormattedStream()
      }
    ],
    serializers: stdSerializers,
  });

}
