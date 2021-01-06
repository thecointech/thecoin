import { FetchNewDepositEmails } from './index'

// Don't go to the server for this
jest.mock('./auth')

beforeAll(async () => {
  const timeout = 30 * 60 * 1000;
  jest.setTimeout(timeout);
});

it('Can fetch new emails (mocked)', async () => {
  const deposits = await FetchNewDepositEmails();
  expect(deposits).not.toBeUndefined();
  // ensure these are all test emails;
  const allTests = deposits.every(d => d.name.indexOf('TEST') >= 0);
  expect(allTests).toBe(true);
  const allRaw = deposits.every(d => d.raw != undefined);
  expect(allRaw).toBe(true);

  // ensure we have sourceID;
  const allSources = deposits.every(d => !!d.id);
  expect(allSources).toBe(true);
})
