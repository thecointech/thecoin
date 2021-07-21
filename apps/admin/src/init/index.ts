import { RbcStore } from "@thecointech/rbcapi";
import { ConfigStore } from '@thecointech/store';
import { initBrowser } from '@thecointech/rbcapi';
import { initialize } from '@thecointech/tx-gmail';
import open from 'open';

//
// Initialize (most of) the application
// Does not initialize accounts or contract
export function Initialize() {
  RbcStore.initialize({ adapter: "leveldb" });
  ConfigStore.initialize({ adapter: "leveldb" });

  initBrowser({ headless: true });
  initialize(initGmail);
}

async function initGmail(authUrl: string) {
  open(authUrl);
  return new Promise<string>((_resolve, reject) => {
    // TODO: We can't open a server to listen to the
    // reply, but we already have one running.  We should
    // be able to figure out how to collect the reply
    reject("TODO");
  })
}
