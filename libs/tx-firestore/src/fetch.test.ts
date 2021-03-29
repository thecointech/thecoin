import { getAllFromFirestore } from './fetch';
import { init } from '@thecointech/utilities/firestore';

it('Can fetch all transactions', async () => {
  jest.setTimeout(30000);
  await init();
  const users = await getAllFromFirestore();

  // Not sure what we can test for here other than the code functions!
  expect(users).toBeTruthy();
})
