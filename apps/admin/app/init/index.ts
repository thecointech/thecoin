import { init } from '@thecointech/logging';
import { RbcStore } from "@thecointech/rbcapi/store";
import { ConfigStore } from '@thecointech/store';
import { initBrowser } from '@thecointech/rbcapi';

//
// Initialize (most of) the application
// Does not initialize accounts or contract
export function Initialize()
{
  RbcStore.initialize({adapter: "leveldb"});
  ConfigStore.initialize({adapter: "leveldb"});

  init("admin");

  initBrowser({headless: true});
}
