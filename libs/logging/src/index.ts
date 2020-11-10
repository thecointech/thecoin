import bunyan, { Stream } from 'bunyan';
import { mkdirSync } from 'fs';

export let log : bunyan = null as any;
const LogLocation = '/temp/TheCoin/logs/';
const areWeTestingWithJest = () => process.env.JEST_WORKER_ID !== undefined;

const getFileStream = (name: string) : Stream => (
  {
    level: 'debug',
    type: 'rotating-file',
    path: `${LogLocation}/${name}.log`,
    period: '1d',   // daily rotation
    count: 3        // keep 3 back copies
  });

const getConsoleStream = () : Stream => (
  {
    level: 'trace',
    stream: process.stdout            // log INFO and above to stdout
  }
)

const getStreams = (filename: string) =>
  areWeTestingWithJest()
    ? [
        getConsoleStream()
      ]
    : [
        getConsoleStream(),
        getFileStream(filename)
      ]

export function init(name: string) {
  // TODO: Obvs, we can't do this on appengine/browser.
  mkdirSync(LogLocation, { recursive: true });
  log = bunyan.createLogger({
    name,
    streams: getStreams(name)
  });

  log.trace('Logging Initialized');
}
