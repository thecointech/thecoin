// NOTE!  tsoa requires the original (source) enum here, not the compiled version
import { CurrencyCode } from "@the-coin/utilities/CurrencyCodes";

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

// Note; this includes '0' as code for THE,
// but it shouldn't, as that's covered by CoinRate
export type RatesMapping = {
  [code in CurrencyCode]: number;
}

export type FxRates = {
    validFrom: number;
    validTill: number;
} & RatesMapping;

export type RateType = CoinRate|FxRates;
export type RateKey = "Coin"|"FxRates";

// Required to be interface for correct parsing by tsoa in swagger2.  Could be converted back to type once we jump to 3.
export interface CombinedRates extends RatesMapping, CoinRate {
  fxRate: number,  // To remove: supports old method where we only had 1 currency per query
  target: CurrencyCode, // To remove: supports old method where we only had 1 currency per query
};

// Rename to FXRate to ease code churn in the rest of the project.
// TODO: Sync naming across the project, this should be consistent everywhere
export interface FXRate extends CombinedRates {};
