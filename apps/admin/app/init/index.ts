import secret from './secret.json';
import { RbcApi } from '@the-coin/rbcapi';
import { init } from '@the-coin/logging';
import { RbcStore } from "@the-coin/rbcapi/store";
import { ConfigStore } from '@the-coin/store';
import { initBrowser } from '@the-coin/rbcapi/build/action';

//
// Initialize (most of) the application
// Does not initialize accounts or contract
export function Initialize()
{
  RbcStore.initialize({adapter: "leveldb"});
  ConfigStore.initialize({adapter: "leveldb"});

  init("admin");
  RbcApi.SetCredentials(secret)

  initBrowser({headless: false});
}
