import { jest } from '@jest/globals';
import fns from './index_mocked';
import { queryNewDepositEmails } from './query'

beforeAll(async () => {
  const timeout = 30 * 60 * 1000;
  jest.setTimeout(timeout);
  await fns.initialize();
});

it('Can fetch new emails (mocked)', async () => {
  const deposits = await queryNewDepositEmails();
  expect(deposits).not.toBeUndefined();
  // ensure these are all test emails;
  expect(deposits.map(d => d.name)).toEqual(['Not found', 'Not found', 'Some Person', 'Not found']);
  expect(deposits.every(d => d.raw !== undefined)).toBeTruthy();

  // ensure we have sourceID;
  expect(deposits.every(d => !!d.id)).toBeTruthy();
})
