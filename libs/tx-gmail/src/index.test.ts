import { jest } from '@jest/globals';
import { queryNewDepositEmails } from './query'
import { initializeApi } from './fetch'

it('Can fetch new emails (mocked)', async () => {
  await initializeApi({} as any);

  const deposits = await queryNewDepositEmails();
  expect(deposits).not.toBeUndefined();
  // ensure these are all test emails;
  expect(deposits.map(d => d.name)).toEqual(['Not found', 'Not found', 'Some Person', 'Not found']);
  expect(deposits.every(d => d.raw !== undefined)).toBeTruthy();

  // ensure we have sourceID;
  expect(deposits.every(d => !!d.id)).toBeTruthy();
})
