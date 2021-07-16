import { RbcStore } from "@thecointech/rbcapi";
import { ConfigStore } from '@thecointech/store';
import { initBrowser } from '@thecointech/rbcapi';
import { initialize } from '@thecointech/tx-gmail';
import { shell } from 'electron';

//
// Initialize (most of) the application
// Does not initialize accounts or contract
export function Initialize() {
  RbcStore.initialize({ adapter: "leveldb" });
  ConfigStore.initialize({ adapter: "leveldb" });

  initBrowser({ headless: true });
  initialize(initGmail);
}

function initGmail(authUrl: string) {
  if (shell)
    shell.openExternal(authUrl);
  else {
    const start = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open');
    require('child_process').exec(start + ' ' + authUrl);
  }
}
