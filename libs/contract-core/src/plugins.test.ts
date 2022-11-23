import { getPluginDetails, toCoin, toFiat } from './plugins';
import { ConnectContract } from './index_mocked';
import { Wallet } from '@ethersproject/wallet';
import type { FXRate } from '@thecointech/pricing';
import { DateTime } from 'luxon';

it ('Generates a useful modifier', async () => {
  const signer = Wallet.createRandom()
  var contract = await ConnectContract(signer);
  const [details] = await getPluginDetails(contract);
  const timestamp = 0;
  const rates = [{
    buy: 2,
    sell: 2,
    fxRate: 1,
    validFrom: 0,
    validTill: Number.MIN_SAFE_INTEGER,
  } as FXRate];
  const fiat = 1999e2; // $1999
  const coin = toCoin([fiat, timestamp], rates);
  // run the modifier

  const rcoin = details.modifier!(coin, DateTime.fromSeconds(timestamp), rates);
  const rfiat = toFiat([rcoin, timestamp], rates);
  expect(rfiat.toNumber()).toBe(1900e2);
})
