import { jest } from '@jest/globals';
import Decimal from 'decimal.js-light';

// Theoretically, we could user hardhat to spin up a whole
// working version of the contract, but that sounds like
// a lot of work.
jest.unstable_mockModule("@ethersproject/contracts", () => ({
  Contract: class {
    filters = {
      ValueChanged: () => {},
    }
    queryFilter = () => Promise.resolve([
      {
        args: {
          user,
          msTime: new Decimal(0),
          path: "pending[user].total",
          change: new Decimal(100),
        }
      }
    ] as any)
  }
}))

const { getModifier, user } = await import('../internal/common');


it ('Compiles and runs UberConverter', async () => {
  const modifier = await getModifier("UberConverter");
  expect(modifier).toBeTruthy();

  const rfiat = modifier(1000e2, 0);
  expect(rfiat.toNumber()).toBe(1000e2);
})

it ('UberConverter correctly accesses data', async () => {

  const modifier = await getModifier("UberConverter");
  const rfiat = modifier(1000, 1); // User has $100 pending
  expect(rfiat.toNumber()).toBe(900);
})
