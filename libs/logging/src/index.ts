import bunyan, { Stream } from 'bunyan';
import debug_stream from 'bunyan-debug-stream';
import { mkdirSync } from 'fs';
import { join } from 'path';

// NOTE: our log is declared as type 'bunyan', but then
// explicitly initialized to null (a violation of that type).
// We do this because we treat logging as an omni-present
// service (ie, no null checks) but require the client app
// to manually initialize us.  In other words, we are replacing
// the compilers guarantee with one we manage manually.  If this
// variable is null, that means logging hasn't been init'ed (yet).
export let log : bunyan = null! as bunyan;

const basepath = join(__dirname, "..", "..", "..");
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
    stream: debug_stream({
      basepath,
      forceColor: true,
    })
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
