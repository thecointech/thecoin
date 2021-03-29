import { authorize, isValid, finishLogin } from './auth';
import { ConfigStore } from '@thecointech/store';

beforeAll(() => {
  ConfigStore.initialize();
});
afterAll(() => {
  ConfigStore.release();
});

// This test is partly to test whether or not we have Auth, and
// partly to give a way to actually complete login
// (note: the complete login part should be extracted to console app)
test("We have gmail login", async () => {
  jest.setTimeout(500000);

  const client = await authorize();

  if (!isValid(client))
  {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const code = await readline.question("Enter Code:");
    finishLogin(client, code);
    await readline.destroy();
  }
  expect(isValid(client)).toBeTruthy();
});
