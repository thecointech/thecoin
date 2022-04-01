import { fetchRate } from '@thecointech/fx-rates';
import { log } from '@thecointech/logging';
import { nextOpenTimestamp } from '@thecointech/market-status';
import { NormalizeAddress } from '@thecointech/utilities';
import { DateTime } from 'luxon';
import { toCoin } from './pricing';
import { burnCoins, mintCoins, runCloneTransfer } from './transfers';
import type { CurrencyKey } from "@thecointech/fx-rates";
import type { Decimal } from 'decimal.js-light';
import { getSigner } from '@thecointech/signers';
import { grantSuperPermissions, revokeSuperPermissions } from './permissions';

type MintData = {
  originator: string,
  date: DateTime,
  fiat: Decimal,
  currency: CurrencyKey,
}

export async function processItems(items: MintData[]){
  await grantSuperPermissions();

  log.info(`Minting ${items.length} items`);
  for (const item of items) {
    await processItem(item);
  }
  log.info(`Minting done`);

  await revokeSuperPermissions();
}

async function processItem({fiat, date, originator, currency}: MintData) {

  log.trace(`Minting ${fiat} at ${date.toString()}`);

  // First; convert from fiat to token
  const rate = await fetchRate(date.toJSDate());
  if (!rate) throw new Error("Kerplewey");
  const coin = await toCoin(rate, fiat, currency);

  const to = fixAddress(originator);
  const theCoinAddress = fixAddress("TheCoin");
  if (coin.gt(0)) {
    await mintCoins(coin, to, date);
    // If not intended for Core, forward this onto final recipient
    //await runCloneTransfer(theCoinAddress, to, coin.toNumber(), 0, date);

  } else {
    const abs = coin.abs();
    // Transfer back to broker for burning
    await runCloneTransfer(to, theCoinAddress, abs.toNumber(), 0, date);
    // Burn coins
    await burnCoins(abs, date);
  }
}

const fixAddress = (address: string) => process.env[`WALLET_${address}_ADDRESS`] ?? NormalizeAddress(address);
