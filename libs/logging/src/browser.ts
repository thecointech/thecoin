import { createLogger, TRACE, DEBUG, WARN, stdSerializers } from 'browser-bunyan';
import { ConsoleFormattedStream } from '@browser-bunyan/console-formatted-stream';
import { BunyanLogger } from 'logger';

// const getStreams = (_name: string) => {
//   const streams = [new ConsoleFormattedStream()];
//   // if (process.env.TC_LOG_HTTP_ENDPOINT)
//   // {
//   //   const { getFileStream } = await import('./filestream');
//   //   const stream = getFileStream(name, process.env.TC_LOG_HTTP_ENDPOINT, true)
//   //   streams.push(stream);
//   // }
//   return streams;
// }

export function init(name: string): BunyanLogger {
  return createLogger({
    name,
    streams: [
      {
        level: process.env.NODE_ENV === "development"
          ? TRACE
          : process.env.SETTINGS === "staging"
            ? DEBUG
            : WARN,
        stream: new ConsoleFormattedStream()
      }
    ],
    serializers: stdSerializers,
  });

}
