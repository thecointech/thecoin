import { getAllFromFirestore } from './fetch';
import { init } from '@the-coin/utilities/firestore';

beforeAll(async () => {
  await init({});
});

it('Can fetch all transactions', async () => {
  jest.setTimeout(30000);
  const users = await getAllFromFirestore();

  // Not sure what we can test for here other than the code functions!
  expect(users).toBeTruthy();
})
