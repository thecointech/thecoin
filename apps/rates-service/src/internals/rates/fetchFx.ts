import { CurrencyCode, CurrencyKey } from "@thecointech/fx-rates";
import { alignToNextBoundary } from "./fetchUtils";
import { FXUpdateInterval, FxRates, RatesMapping } from "./types";
import { fetchNewFxRates, FinnhubFxQuotes } from "../FinnHub";

export async function fetchFxRate(currentValidUntil: number, now: number) : Promise<FxRates> {

  // We reset validFrom to be timestamp (as we can't
  // set a price in the past)
  const validFrom = currentValidUntil;
  const updateFrom = Math.max(validFrom, now);
  let validUntil = alignToNextBoundary(updateFrom, FXUpdateInterval)

  // Update with the latest USD/CAD forex
  // Unlike stocks, this is a point-in-time,
  // not OHLC, so we just take whatever value
  // we get as the rate for the next interval
  const {quote} = await fetchNewFxRates();

  // Our currencies come in with string keys.  This loop
  // converts them to use the CurrencyCode enum
  var fxRates = {} as RatesMapping;
  for (const key of Object.keys(quote))
  {
    const code = CurrencyCode[key as CurrencyKey];
    if (code) {
      fxRates[code] = quote[key as keyof FinnhubFxQuotes];
    }
  }

  // Return 'em all
  return {
    ...fxRates,
     validFrom,
     validTill: validUntil
  };
}
