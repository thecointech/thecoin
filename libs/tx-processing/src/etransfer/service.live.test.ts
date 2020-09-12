import { ConfigStore } from '@the-coin/store';
import { init, release } from '@the-coin/utilities/firestore/jestutils';
import { fetchActionsToComplete, getInstructions } from './service';
import { signIn } from '../firestore';

jest.unmock("googleapis")

jest.disableAutomock()

beforeAll(async () => {
  const timeout = 30 * 60 * 1000;
  jest.setTimeout(timeout);
  ConfigStore.initialize();
  await init('broker-cad');
  await signIn();
});

afterAll(() => {
  ConfigStore.release();
  release();
});

it("Fetches a deposit correctly", async () => {
  var actions = await fetchActionsToComplete();
  var instructions = await getInstructions(actions);

  expect(instructions.length).toBe(actions.length);
})
