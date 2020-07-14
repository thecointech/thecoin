import {CurrencyCode} from '@the-coin/utilities/CurrencyCodes'
// Rates come into effect 30 seconds afeter the market rate.
// This to allow us time to update, and give brokers plenty of time
// to update their local caches before the new rate comes
// into effect.
export const RateOffsetFromMarket = 30 * 1000
// How often to update the coin exchange rate/minimum interval
// a rate is valid for.  For testing period, we set this
// to a loooong time (3hrs), in production this should be
// set to 1 minute (shortest possible interval)
export const CoinUpdateInterval = 60 * 60 * 3 * 1000;
export const FXUpdateInterval = CoinUpdateInterval;

//
// The exchange rate from Coin to USD
// We use the buy/sell difference to capture
// the slight delta between market buy/sell prices
//
export type CoinRate = {
    buy: number;
    sell: number;
    validFrom: number;
    validTill: number;
}

//
// The exchange rate from USD to other supported
// currencies.  We use the published rate, with no markup
//
export type RatesMapping = {
  [code in CurrencyCode]: number;
}
export type FxRates = {
    validFrom: number;
    validTill: number;
} & RatesMapping;

export type RateType = CoinRate|FxRates;
export type RateKey = "Coin"|"FxRates";
export type CombinedRates = {
  fxRate: number,  // To remove: supports old method where we only had 1 currency per query
  target: CurrencyCode, // To remove: supports old method where we only had 1 currency per query
} & CoinRate & RatesMapping;
