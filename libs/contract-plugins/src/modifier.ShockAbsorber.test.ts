
import { jest } from '@jest/globals';
import Decimal from 'decimal.js-light';

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
          path: "cushions[user].fiatPrincipal",
          change: new Decimal(2000),
        }
      },
      {
        args: {
          user,
          msTime: new Decimal(0),
          path: "cushions[user].maxCovered",
          change: new Decimal(20000000), // Assumes rate of 2
        }
      }
    ] as any)
  }
}))

const { getModifier, user } = await import('../internal/common');

it ('ShockAbsorber correctly accesses data', async () => {
  const modifier = await getModifier("ShockAbsorber");
  const rfiat = modifier(1000, 1); // User has $100 pending
  expect(rfiat.toNumber()).toBe(2000);
})
