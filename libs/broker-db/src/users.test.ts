import { init, filterByEmulator } from '@thecointech/firestore';
import { describe } from '@thecointech/jestutils';
import { getAllUsers } from 'users';
import { IsValidAddress } from '@thecointech/utilities'

describe('Live DB fetching', () => {

  beforeAll(() => {
    init();
  });
  it('Can fetch new all users', async () => {

    await init();
    const users = await getAllUsers();

    // There should be (at least) 41 entries
    expect(users.length).toBeGreaterThanOrEqual(41);
    expect(users.every(IsValidAddress)).toBeTruthy();
  })

}, filterByEmulator)
