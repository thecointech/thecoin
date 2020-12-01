import { RbcStore } from './store';
import * as PouchDB from 'pouchdb';
import { initBrowser } from './action';
import { send } from './etransfer';
import { RbcApi } from '.';
import credentials from './api.test.secret.json';


beforeAll(() => {
    PouchDB.plugin(require('pouchdb-adapter-memory'));
    RbcStore.initialize({
        adapter: "memory"
    });
});

afterAll(() => {
    RbcStore.release();
});


test.skip("Can send e-Transfer", async () => {
  jest.setTimeout(500000);
  try {
    RbcApi.SetCredentials(credentials);

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
