import { init, filterByEmulator } from '@thecointech/firestore';
import { describe } from '@thecointech/jestutils';
import { getUserData, setUserVerified } from 'user';
import { DateTime } from 'luxon';
import { userDataConverter } from 'user.types';

describe('Live DB fetching', () => {

  beforeAll(() => {
    init();
  });

  it('can convert to/from DB', async () => {

    const spyTo = jest.spyOn(userDataConverter, "toFirestore");
    const spyFrom = jest.spyOn(userDataConverter, "fromFirestore");

    const dt = DateTime.now();
    const address = "0x1234567890123456789012345678901234567890";
    await setUserVerified(address, address, dt);
    expect(spyTo).toBeCalledTimes(1);
    expect(spyFrom).toBeCalledTimes(0);
    // We should get back a DateTime if we get this back
    // Ideally we would spy on the converter
    const data = await getUserData(address);
    expect(spyTo).toBeCalledTimes(1);
    expect(spyFrom).toBeCalledTimes(1);
    expect(data?.verifiedTimestamp).toEqual(dt);
  })
}, filterByEmulator)
