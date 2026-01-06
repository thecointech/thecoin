import { jest } from '@jest/globals';
import Decimal from 'decimal.js-light';
import { getProvider } from '@thecointech/ethers-provider/Erc20Provider';

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
            path: "pending[user].total",
            change: new Decimal(100),
          }
        }
      ])
    })
  }
}))

const { getModifier, user } = await import('../internal/common');

it ('Compiles and runs UberConverter', async () => {
  const modifier = await getModifier("UberConverter", await getProvider());
  expect(modifier).toBeTruthy();

  const rfiat = modifier(1000e2, 0);
  expect(rfiat.toNumber()).toBe(1000e2);
})

it ('UberConverter correctly accesses data', async () => {

  const modifier = await getModifier("UberConverter", await getProvider());
  const rfiat = modifier(1000, 1); // User has $100 pending
  expect(rfiat.toNumber()).toBe(900);
})
