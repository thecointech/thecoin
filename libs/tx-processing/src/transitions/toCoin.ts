import Decimal from "decimal.js-light";
import { DateTime } from "luxon";
import { getCurrentState, TransitionCallback } from "statemachine/types";
import { RatesApi } from "@thecointech/pricing";
import { toCoinDecimal } from "@thecointech/utilities";
import { log } from "@thecointech/logging";
import { NextOpenTimestamp } from "@thecointech/utilities/MarketStatus";

//
// Convert fiat to coin
export const toCoin: TransitionCallback = async (container) => {

  // First, what is our settlement date here?
  const initiated = container.history[0].delta.timestamp;
  const nextOpen = await NextOpenTimestamp(initiated.toJSDate());
  if (nextOpen < Date.now())
    return null;

  const timestamp = DateTime.fromMillis(nextOpen);
  const convertAt = await getConvertAt(timestamp);
  if (!convertAt) return { error: `Failed fetching exchange rate for ${timestamp}`};

  const currentState = getCurrentState(container);
  const coin = currentState.data.fiat.div(convertAt)
  return {
    timestamp,
    fiat: new Decimal(0),
    coin: toCoinDecimal(coin),
  }
}

async function getConvertAt(timestamp: DateTime) {
  const ratesApi = new RatesApi();

  // Ok, lets get an FX result for this
  const rate = await ratesApi.getSingle(124, timestamp.toMillis());
  if (rate.status != 200 || !rate.data.sell) {
    log.error(`Error fetching rate for: ${timestamp}`);
    return false;
  }

  const { sell, fxRate } = rate.data;
  return sell * fxRate;
}
