import { init as initlog, log } from '@thecointech/logging';

export async function init() {
  // Logging (todo: connect to logs aggregator)
  initlog('nft-service');
  log.trace('Initialization complete')
}
