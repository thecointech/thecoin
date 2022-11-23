import type { FXRate } from '@thecointech/pricing';
import { getPluginModifier, toCoin, toFiat } from './plugins';

it ('Generates a useful modifier', async () => {
  const modifier = await getPluginModifier('test');
  const fiat = 1999e2; // $1999
  const timestamp = 0;
  const rates = [{
    buy: 2,
    sell: 2,
    fxRate: 1,
    validFrom: 0,
    validTill: Number.MIN_SAFE_INTEGER,
  } as FXRate];
  const coin = await toCoin([fiat, timestamp], rates);
  // run the modifier

  const rcoin = await modifier!(coin, timestamp, rates);
  const rfiat = await toFiat([rcoin, timestamp], rates);
  expect(rfiat.toNumber()).toBe(1900e2);
})
