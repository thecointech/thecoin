import { getAllActions } from '.';
import { getAllUsers } from '../users';
import { init } from '@thecointech/firestore';
import { describe, filterByEmulator } from '@thecointech/firestore/jest.emulator';

describe('Transaction Fetch' , () => {
  it('Can fetch all transactions', async () => {
    jest.setTimeout(30000);
    await init();
    const users = await getAllUsers();
    // Not sure what we can test for here other than the code functions!
    const actions = await getAllActions(users);
    expect(actions).toBeTruthy();
  })
}, filterByEmulator());
