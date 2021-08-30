process.env.CONFIG_NAME = "prod";
require("../../../tools/setenv");

import { RbcStore } from './store';
import { ApiAction, initBrowser } from './action';
import { send } from './etransfer';
import { describe, IsManualRun } from '@thecointech/jestutils';


// Note, this test will send real money from a real account.
// So ya probably want to leave it disabled except for manual runs.
describe("Live tests on live account", () => {

  beforeAll(() => {
    // Will init mocked store
    ApiAction.initCredentials();
    RbcStore.initialize();
  });

  afterAll(() => {
    RbcStore.release();
  });

  test("Can send e-Transfer", async () => {
    jest.setTimeout(500000);
    try {

      // Always display browser for manual test
      const browser = await initBrowser({
        headless: false
      })

      const confirmation = await send("TestEmail", 5, "test", {
        email: "test@thecoin.io",
        question: "question",
        answer: "tgb",
        message: "message",
      });
      expect(confirmation).toBeTruthy();

      await browser.close();
    }
    catch(e) {
      console.error(e);
      fail(e);
    }
  });
}, IsManualRun);

