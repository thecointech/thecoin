import { RbcStore } from "@thecointech/rbcapi";
import { ConfigStore } from '@thecointech/store';
import { initBrowser } from '@thecointech/rbcapi';
import { initialize as initGmail } from '@thecointech/tx-gmail';
import { log } from '@thecointech/logging';
import { initAccounts } from './accounts';
import { initSidebar } from './sidebar';
import { configureAdminStore } from './reducers';
import { gmailSignIn } from './gmail/renderer';
import { initFirestore } from './firestore';

//
// Initialize (most of) the application
// Does not initialize accounts or contract
export function initialize() {

  // initialize logging first
  log.info(`Loading App: ${__VERSION__} - ${process.env.CONFIG_NAME}`);

  initSidebar();
  initAccounts();

  RbcStore.initialize();
  ConfigStore.initialize();

  initBrowser({ headless: true });
  initGmail(gmailSignIn);

  initFirestore();

  return configureAdminStore();
}
