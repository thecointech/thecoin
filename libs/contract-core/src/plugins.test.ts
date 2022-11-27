import { getPluginDetails, getPluginModifier, PluginEmulator, toCoin, toFiat } from './plugins';
import { ALL_PERMISSIONS, ConnectContract } from './index_mocked';
import { Wallet } from '@ethersproject/wallet';
import { DateTime } from 'luxon';
import type { FXRate } from '@thecointech/pricing';
import { BigNumber } from 'ethers';
import Decimal from 'decimal.js-light';

it ('Generates a useful modifier', async () => {
  const signer = Wallet.createRandom()
  var contract = await ConnectContract(signer);
  const [details] = await getPluginDetails(contract);
  // run the modifier
  const rfiat = runModifier(details.emulator!, 1999e2, 0);
  expect(rfiat.toNumber()).toBe(1900e2);
})

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

function runModifier(emulator: PluginEmulator, fiat: number, timestamp: number) {
  const rates = [{
    buy: 2,
    sell: 2,
    fxRate: 1,
    validFrom: 0,
    validTill: Number.MIN_SAFE_INTEGER,
  } as FXRate];
  const coin = toCoin([fiat, timestamp], rates);
  const rcoin = emulator.balanceOf(coin, DateTime.fromSeconds(timestamp), rates);
  return toFiat([rcoin, timestamp], rates);
}
