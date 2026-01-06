import { log } from '@thecointech/logging';
import { configureHarversterStore } from './reducers';
import { initAccounts } from './accounts';

//
// Initialize (most of) the application
export async function initialize() {

  try {
    await initAccounts();

    log.trace("Initialization complete");
    return configureHarversterStore();
  }
  catch (e: any) {
    log.fatal(e, "Couldn't complete initialization");
    alert(e.message);
    throw e;
  }
}
