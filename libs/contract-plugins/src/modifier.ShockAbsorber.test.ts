
import { jest } from '@jest/globals';
import { getProvider } from '@thecointech/ethers-provider/Erc20Provider';
import Decimal from 'decimal.js-light';

jest.unstable_mockModule("./codegen", () => ({
  BasePlugin__factory: {
    connect: () => ({
      filters: {
        ValueChanged: () => ({})
      },
      queryFilter: () => Promise.resolve([
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
      ])
    })
  }
}))

const { getModifier, user } = await import('../internal/common');

it ('ShockAbsorber correctly accesses data', async () => {
  const provider = await getProvider();
  const modifier = await getModifier("ShockAbsorber", provider);
  const rfiat = modifier(1000, 1); // User has $100 pending
  expect(rfiat.toNumber()).toBe(2000);
})
