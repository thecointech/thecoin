//import {Timestamp} from "@google-cloud/firestore";
import { Timestamp} from "@the-coin/types"
import {CurrencyCode} from '@the-coin/utilities/CurrencyCodes'

export type ExchangeRate = {
    Buy: number;
    Sell: number;
    ValidFrom: number;
    ValidUntil: number;
}

export type FXRate = {
    Rate: number;
    ValidFrom: number;
    ValidUntil: number;
}

//
// The exchange rate from Coin to USD
// We use the buy/sell difference to capture
// the slight delta between market buy/sell prices
//
export type CoinRate = {
  buy: number;
  sell: number;
  validFrom: Timestamp;
  validTill: Timestamp;
}

//
// The exchange rate from USD to other supported
// currencies.  We use the published rate, with no markup
//
export type RatesMapping = {
[code in CurrencyCode]: number;
}
export type FxRates = {
  validFrom: Timestamp;
  validTill: Timestamp;
} & RatesMapping;

export type RateType = CoinRate|FxRates;
export type RateKey = "Coin"|"FxRates";
