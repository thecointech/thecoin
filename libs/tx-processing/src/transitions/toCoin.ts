import Decimal from "decimal.js-light";
import { DateTime } from "luxon";
import { AnyActionContainer, getCurrentState } from "statemachine/types";
import { RatesApi } from "@thecointech/pricing";
import { toCoinDecimal, toHumanDecimal } from "@thecointech/utilities";
import { log } from "@thecointech/logging";
import { NextOpenTimestamp } from "@thecointech/utilities/MarketStatus";

//
// Convert fiat to coin
export function toCoin(container: AnyActionContainer) {
  return doConversion(container, "fiat", "coin", toCoinDecimal);
}

//
// Convert coin to fiat
export function toFiat(container: AnyActionContainer) {
  return doConversion(container, "coin", "fiat", toHumanDecimal);
}

type Currency = "fiat"|"coin";
async function doConversion(container: AnyActionContainer, from: Currency, to: Currency, multiplier: (d: Decimal) => Decimal) {
  const currentState = getCurrentState(container);
  const fromValue = currentState.data[from];
  if (!fromValue || fromValue.isZero()) {
    return { error: `Cannot convert from ${from} to ${to}: no value for ${from}`};
  }

  // First, what is our settlement date here?
  const initiated = container.action.data.timestamp;
  const nextOpen = await NextOpenTimestamp(initiated.toJSDate());
  if (nextOpen >= Date.now())
    return null;

  const timestamp = DateTime.fromMillis(nextOpen);
  const convertAt = await getConvertAt(timestamp, from);
  if (!convertAt) return { error: `Failed fetching exchange rate for ${timestamp}`};

  const toValue = fromValue.div(convertAt);

  return {
    timestamp,
    [from]: new Decimal(0),
    [to]: multiplier(toValue),
  }
}

// Fetch conversion rate from server
async function getConvertAt(timestamp: DateTime, from: Currency) {
  const ratesApi = new RatesApi();
  const rate = await ratesApi.getSingle(124, timestamp.toMillis());
  if (rate.status != 200 || !rate.data.sell) {
    log.error(`Error fetching rate for: ${timestamp}`);
    return false;
  }
  const { buy, sell, fxRate } = rate.data;
  return fxRate * (from == "fiat" ? sell : buy);
}
