import { jest } from '@jest/globals';
import Decimal from 'decimal.js-light';
import { Erc20Provider } from '@thecointech/ethers-provider/Erc20Provider';

// Theoretically, we could user hardhat to spin up a whole
// working version of the contract, but that sounds like
// a lot of work.
jest.unstable_mockModule("@ethersproject/contracts", () => ({
  Contract: class {
    filters = {
      ValueChanged: () => ({}),
    }
    interface = {
      parseLog: l => l,
    }
  }
}))

const { getModifier, user } = await import('../internal/common');

const getProvider = () => {
  const provider = new Erc20Provider();
  provider.getEtherscanLogs = () => Promise.resolve([
    {
      args: {
        user,
        msTime: new Decimal(0),
        path: "pending[user].total",
        change: new Decimal(100),
      }
    }
  ]) as any;
  return provider;
}
it ('Compiles and runs UberConverter', async () => {
  const modifier = await getModifier("UberConverter", getProvider());
  expect(modifier).toBeTruthy();

  const rfiat = modifier(1000e2, 0);
  expect(rfiat.toNumber()).toBe(1000e2);
})

it ('UberConverter correctly accesses data', async () => {

  const modifier = await getModifier("UberConverter", getProvider());
  const rfiat = modifier(1000, 1); // User has $100 pending
  expect(rfiat.toNumber()).toBe(900);
})
