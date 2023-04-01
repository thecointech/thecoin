import { jest } from '@jest/globals';
import { ALL_PERMISSIONS } from './constants';
import { BigNumber } from 'ethers';
import Decimal from 'decimal.js-light';

import { Erc20Provider } from '@thecointech/ethers-provider/Erc20Provider';

it ('Compiles and runs UberConverter', async () => {
  const modifier = await getModifier("UberConverter");
  expect(modifier).toBeTruthy();

  const rfiat = modifier(1000e2, 0);
  expect(rfiat.toNumber()).toBe(1000e2);
})

it ('UberConverter correctly accesses data', async () => {
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

  const modifier = await getModifier("UberConverter");
  const rfiat = modifier(1000, 1); // User has $100 pending
  expect(rfiat.toNumber()).toBe(900);
})

it ('ShockAbsorber correctly accesses data', async () => {
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

  const modifier = await getModifier("ShockAbsorber");
  const rfiat = modifier(1000, 1); // User has $100 pending
  expect(rfiat.toNumber()).toBe(2000);
})

const user = "0x1234567890123456789012345678901234567890";
const permissions = BigNumber.from(ALL_PERMISSIONS);
const getModifier = async (plugin: string, provider?: Erc20Provider) => {
  const { getPluginModifier } = await import('./modifier');
  const r = await getPluginModifier(user, { plugin, permissions } as any, provider);

  const { runModifier } = await import('../internal/common');
  return (fiat: number, timestamp: number) => {
    return runModifier(r, fiat, timestamp);
  }
}
