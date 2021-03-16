import { fetchAllUsers } from './users';
import { init } from '@thecointech/utilities/firestore';
import { IsValidAddress } from '@thecointech/utilities';

it('Can fetch new all users', async () => {

  await init();
  const users = await fetchAllUsers();

  // There should be (at least) 41 entries
  expect(users.length).toBeGreaterThanOrEqual(41);

  expect(users.find(s => !IsValidAddress(s))).toBeFalsy();
})
