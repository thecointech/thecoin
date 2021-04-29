import { getAllUsers } from './users';
import { init, filterByEmulator } from '@thecointech/firestore';
import { IsValidAddress } from '@thecointech/utilities';
import { describe } from '@thecointech/jestutils';

describe('Live DB fetching', () => {
  it('Can fetch new all users', async () => {

    await init();
    const users = await getAllUsers();

    // There should be (at least) 41 entries
    expect(users.length).toBeGreaterThanOrEqual(41);

    expect(users.every(IsValidAddress)).toBeTruthy();
  })
}, filterByEmulator)
