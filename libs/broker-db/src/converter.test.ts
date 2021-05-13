import { init, filterByEmulator, isDateTime } from '@thecointech/firestore';
import { describe } from '@thecointech/jestutils';
import { getUserData, setUserVerified } from 'user';
import { DateTime } from 'luxon';
import { userDataConverter } from 'user.types';
import { getActionFromInitial } from 'transaction';
import Decimal from 'decimal.js-light';
import { PurchaseType } from 'transaction/types';

describe('Live DB fetching', () => {

  beforeAll(() => {
    init();
  });

  // Test Address.  Uses Timestamp to give uniqueness because tests
  // do not clean up after themselves.
  const address = `0x123456789012345678901234567${Date.now()}`;
  const spyTo = jest.spyOn(userDataConverter, "toFirestore");
  const spyFrom = jest.spyOn(userDataConverter, "fromFirestore");


  it('converts timestamps appropriately DB', async () => {
    const dt = DateTime.now();
    await setUserVerified(address, address, dt);
    expect(spyTo).toBeCalledTimes(1);
    expect(spyFrom).toBeCalledTimes(0);
    // We should get back a DateTime if we get this back
    // Ideally we would spy on the converter
    const data = await getUserData(address);
    expect(spyTo).toBeCalledTimes(1);
    expect(spyFrom).toBeCalledTimes(1);
    expect(data?.verifiedDate).toEqual(dt);
  })

  it('converts Decimals appropriately', async () => {
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

    // Have we converted into the right types?
    expect(isDateTime(action1.data.date)).toBeTruthy();
    expect(isDateTime(action2.data.date)).toBeTruthy();
    // Test decimal conversion
    expect(action1.data.initial.amount.toDecimalPlaces).toBeDefined();
    expect(action2.data.initial.amount.toDecimalPlaces).toBeDefined();
  })
}, filterByEmulator)
