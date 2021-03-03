import { createLogger, INFO, stdSerializers } from 'browser-bunyan';
import { ConsoleFormattedStream } from '@browser-bunyan/console-formatted-stream';

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
type BunyanLogger = ReturnType<typeof createLogger>;
export function init(name: string) : BunyanLogger {
  return createLogger({
    name,
    streams: [
      {
          level: INFO, // or use the string 'info'
          stream: new ConsoleFormattedStream()
      }
    ],
  serializers: stdSerializers,
  });

}
