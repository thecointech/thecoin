import { init, filterByEmulator } from '@thecointech/firestore/emulator';
import { describe } from '@thecointech/jestutils';
import { getAllUsers } from './users';
import { IsValidAddress } from '@thecointech/utilities'
import { getActionFromInitial } from './transaction';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';

describe('Live DB fetching', () => {

  beforeAll(() => {
    init();
  });
  it('Can fetch new all users', async () => {

    // Create a new address without verify/referral data
    const newAddress = `0x123456789012345678901234567${Date.now()}`;
    await getActionFromInitial(newAddress, "Buy", {
      date: DateTime.now(),
      initial: {
        amount: new Decimal(1000),
        type: "other",
      },
      initialId: "0989786",
    })
    const users = await getAllUsers();

    // There should be (at least) 41 entries
    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(users.every(IsValidAddress)).toBeTruthy();
    // The following test does not work on emulator
    // because client-side API doesn't support listDocuments
    //expect(users).toContain(newAddress);
  })

}, filterByEmulator)
