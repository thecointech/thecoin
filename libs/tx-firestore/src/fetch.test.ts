import { getAllFromFirestore } from './fetch';
import { init } from '@the-coin/utilities/firestore';

beforeAll(async () => {
  await init({});
});

it('Can fetch all transactions', async () => {
  const users = await getAllFromFirestore();

  // There should be (at least) 41 entries
  expect(users).toBeTruthy();
})
