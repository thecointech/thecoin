import { jest } from "@jest/globals";
import { RbcStore } from './store';
import { ApiAction } from './action';
import { describe } from '@thecointech/jestutils';
import { ifSecret } from '@thecointech/secrets/jestutils';
import { getBalance } from './balance';

jest.setTimeout(500000);

// Note, this test will send real money from a real account.
// So ya probably want to leave it disabled except for manual runs.
describe("Check balance on live account", () => {

  beforeAll(async () => {
    // Will init mocked store
    await ApiAction.initCredentials();
    RbcStore.initialize();
  });

  afterAll(() => {
    RbcStore.release();
  });

  test("Can check balance", async () => {
    try {
      const balance = await getBalance();
      expect(balance).toBeGreaterThan(0);
    }
    catch(e) {
      console.error(e);
      fail(e);
    }
  });
}, await ifSecret('RbcApiCredentials', 'prod'));

