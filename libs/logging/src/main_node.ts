import type { createLogger } from 'browser-bunyan';
import { init as init_node } from './browser';
// NOTE: our log is declared as type 'bunyan', but then
// explicitly initialized to null (a violation of that type).
// We do this because we treat logging as an omni-present
// service (ie, no null checks) but require the client app
// to manually initialize us.  In other words, we are replacing
// the compilers guarantee with one we manage manually.  If this
// variable is null, that means logging hasn't been init'ed (yet).
type BunyanLogger = Omit<ReturnType<typeof createLogger>, "addStream"|"addSerializers"|"child">;
export var log : BunyanLogger = null! as BunyanLogger;

export function init(name: string) {
  // basic env sniffing: are we running in the browser?
  log = init_node(name);
  log.trace('Logging Initialized');
}
