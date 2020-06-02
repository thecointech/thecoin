import { ConfigStore } from '../store/config';
import { authorize, isValid, finishLogin } from './auth';

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

beforeAll(() => {
	ConfigStore.initialize();
});

afterAll(() => {
  ConfigStore.release();
});

test("Can login deets", async () => {
  jest.setTimeout(500000);

  const client = await authorize();

  if (!isValid(client))
  {
    var code = await readline.question("Enter Code:");
    finishLogin(client, code);
  }
  expect(isValid(client)).toBeTruthy();
});
