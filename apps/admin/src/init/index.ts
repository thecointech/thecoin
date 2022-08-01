import { ConfigStore } from '@thecointech/store';
import { log } from '@thecointech/logging';
import { initAccounts } from './accounts';
import { initSidebar } from './sidebar';
import { configureAdminStore } from './reducers';
import { initFirestore } from './firestore';
import { initGmail } from './gmail';

//
// Initialize (most of) the application
export async function initialize() {

  try {
    // initialize logging first
    log.info(`Loading App: ${__VERSION__} - ${process.env.CONFIG_NAME}`);

    ConfigStore.initialize();

    initSidebar();
    await initAccounts();
    await initFirestore();
    await initGmail();

    log.trace("Initialization complete");
    return configureAdminStore();
  }
  catch (e: any) {
    log.fatal(e, "Couldn't complete initialization");
    alert(e.message);
    throw e;
  }
}
