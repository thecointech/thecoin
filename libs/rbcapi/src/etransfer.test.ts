import { jest } from "@jest/globals";
import { RbcStore } from './store';
import { ApiAction } from './action';
import { send } from './etransfer';
import { describe, IsManualRun } from '@thecointech/jestutils';
import { closeBrowser } from './scraper';


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
      const confirmation = await send("TestEmail", 5, "test", {
        email: "test@thecoin.io",
        question: "question",
        answer: "tgb",
        message: "message",
      });
      expect(confirmation).toBeTruthy();

      await closeBrowser();
    }
    catch(e) {
      console.error(e);
      fail(e);
    }
  });
}, IsManualRun);

