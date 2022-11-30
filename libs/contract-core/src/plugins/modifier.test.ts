import { getPluginModifier } from './modifier';
import { ALL_PERMISSIONS } from '../index_mocked';
import { BigNumber } from 'ethers';
import Decimal from 'decimal.js-light';
import { runModifier } from './common.test';

it ('Compiles and runs UberConverter', async () => {
  const modifier = await getModifier("UberConverter");
  expect(modifier).toBeTruthy();

  const rfiat = runModifier(modifier!, 1000e2, 0);
  expect(rfiat.toNumber()).toBe(1000e2);
})

it ('UberConverter correctly accesses data', async () => {
  const modifier = await getModifier("UberConverter");
  // User has $100 pending
  modifier!.currentState.pending = {
    [user]: {
      total: new Decimal(100e2)
    }
  }
  const rfiat = runModifier(modifier!, 1000e2, 0);
  expect(rfiat.toNumber()).toBe(900e2);
})

const user = "0x1234567890";
const permissions = BigNumber.from(ALL_PERMISSIONS);
const getModifier = async (plugin: string) => (await getPluginModifier(user, { plugin, permissions } as any))!;
