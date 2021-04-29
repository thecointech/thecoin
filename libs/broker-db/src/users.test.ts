import { getAllUsers } from './users';
import { init } from '@thecointech/firestore';
import { filterByEmulator } from '@thecointech/firestore/src/debug.test';
import { IsValidAddress } from '@thecointech/utilities';
import { describe } from '@thecointech/jestutils';

describe('Live DB fetching', () => {
  it('Can fetch new all users', async () => {

    await init();
    const users = await getAllUsers();

    // There should be (at least) 41 entries
    expect(users.length).toBeGreaterThanOrEqual(41);

    expect(users.find(s => !IsValidAddress(s))).toBeFalsy();
  })
}, filterByEmulator)
