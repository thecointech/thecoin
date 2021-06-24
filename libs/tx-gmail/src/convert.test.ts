import { toDepositData } from "./convert";
import emails from './__mocks__/emails.get.json';
import { log } from '@thecointech/logging';

it('processes emails correctly', async () => {
  const error = jest.spyOn(log, 'error').mockImplementation();
  for (const email of emails) {
    const eTransfer = toDepositData(email.data);
    if (eTransfer) {
    // ensure these are all test emails;
    expect(eTransfer?.name).toBe('TEST');

    // ensure we have sourceID;
    expect(eTransfer?.id).toBeTruthy();
    }
    //expect(eTransfer).not.toBeNull();
  }
  expect(error).toHaveBeenCalledTimes(2);
})
