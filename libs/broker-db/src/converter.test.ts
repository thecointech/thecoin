import { jest } from '@jest/globals';
import { getFirestore, init, Timestamp } from '@thecointech/firestore';
import { describe, filterByEmulator } from '@thecointech/jestutils';
import { getUserData, setUserVerified } from './user';
import { DateTime } from 'luxon';
import { userDataConverter } from './user.types';
import { getActionFromInitial } from './transaction';
import Decimal from 'decimal.js-light';
import { PurchaseType } from './transaction/types';

describe('Live DB fetching', () => {

  beforeAll(() => {
    init();
  });
  afterEach(() => {
    jest.clearAllMocks();
  })

  // Test Address.  Uses Timestamp to give uniqueness because tests
  // do not clean up after themselves.
  const address = `0x123456789012345678901234567${Date.now()}`;
  const spyTo = jest.spyOn(userDataConverter, "toFirestore");
  const spyFrom = jest.spyOn(userDataConverter, "fromFirestore");

  it('converts to Timestamp in DB', async () => {
    const dt = DateTime.now();
    await setUserVerified(address, { statusUpdated: dt});
    expect(spyTo).toHaveBeenCalledTimes(1);
    // Double check - do we have timestamp in the DB?
    const doc = await getFirestore().doc(`User/${address}`).get();
    const ts: Timestamp = doc.data()?.verifiedDate;
    expect(ts?.nanoseconds).toBeDefined();
  })

  it('converts to DateTime from DB', async () => {
    const dt = DateTime.now();
    await setUserVerified(address, { statusUpdated: dt});
    const data = await getUserData(address);
    expect(spyFrom).toHaveBeenCalledTimes(1);
    expect(data?.statusUpdated).toEqual(dt);
  })

  it('round-trips decimals appropriately', async () => {
    const initial = {
      initial: {
        amount: new Decimal(100),
        type: "other" as PurchaseType,
      },
      initialId: "1234567890",
      date: DateTime.now(),
    }
    const action1 = await getActionFromInitial(address, "Buy", initial);
    const action2 = await getActionFromInitial(address, "Buy", initial);
    // Test decimal conversion
    expect(action1.data.initial.amount.toDecimalPlaces).toBeDefined();
    expect(action2.data.initial.amount.toDecimalPlaces).toBeDefined();
  })
}, filterByEmulator)
