import { getPluginModifier, toCoin, toFiat } from './plugins';

it ('Generates a useful modifier', async () => {
  const modifier = await getPluginModifier('test');
  const fiat = 1999e2; // $1999
  const timestamp = 0;
  const coin = await toCoin([fiat, timestamp]);
  // run the modifier
  const rcoin = await modifier!(coin, timestamp);
  const rfiat = await toFiat([rcoin, timestamp]);
  expect(rfiat.toNumber()).toBe(1900e2);
})
