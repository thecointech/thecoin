import Decimal from "decimal.js-light";
import { DateTime } from "luxon";
import { TypedActionContainer, getCurrentState } from "../types";
import { FXRate, RatesApi } from "@thecointech/pricing";
import { toCoinDecimal, toHumanDecimal } from "@thecointech/utilities";
import { log } from "@thecointech/logging";
import { nextOpenTimestamp } from "@thecointech/market-status";
import { makeTransition } from '../makeTransition';
import { isUberTransfer } from '@thecointech/utilities/UberTransfer'
import { ActionDataTypes } from '@thecointech/broker-db';

type Currency = "fiat" | "coin";
type XferAction = "Buy" | "Sell" | "Bill";
type Converter = (v: Decimal, rate: FXRate) => Decimal;
//
// Convert fiat to coin
export const  toCoin = makeTransition<XferAction>( "toCoin", async (container) =>
  doConversion(container, "fiat", "coin", (val, rate) =>
    toCoinDecimal(val
      .div(rate.fxRate * rate.sell) // the rate we sell at
    ))
);

//
// Convert coin to fiat
export const  toFiat = makeTransition<XferAction>( "toFiat", async (container) =>
  doConversion(container, "coin", "fiat", (val, rate) =>
    toHumanDecimal(val
      .mul(rate.fxRate * rate.buy) // the rate we buy at
    ))
);

async function doConversion(container: TypedActionContainer<XferAction>, from: Currency, to: Currency, multiplier: Converter) {
  const currentState = getCurrentState(container);
  const fromValue = currentState.data[from];
  if (!fromValue || fromValue.isZero()) {
    return { error: `Cannot convert from ${from} to ${to}: no value for ${from}` };
  }

  // First, what is our settlement date here?
  const settledOn = getSettleDate(container);
  const nextOpen = await nextOpenTimestamp(settledOn);
  if (nextOpen >= Date.now())
    return null;

  const date = DateTime.fromMillis(nextOpen);
  const convertAt = await getConvertAt(date);
  if (!convertAt) return { error: `Failed fetching exchange rate for ${date}` };

  return {
    date,
    [from]: new Decimal(0),
    [to]: multiplier(fromValue, convertAt),
  }
}

// Fetch conversion rate from server
async function getConvertAt(date: DateTime) {
  const ratesApi = new RatesApi(undefined, process.env.URL_SERVICE_RATES);
  const rate = await ratesApi.getSingle(124, date.toMillis());
  if (rate.status != 200 || !rate.data.sell) {
    log.error(`Error fetching rate for: ${date}`);
    return false;
  }
  return rate.data;
  // const { buy, sell, fxRate } = rate.data;
  // return fxRate * (from == "fiat" ? sell : buy);
}

function getSettleDate(container: TypedActionContainer<XferAction>) {
  const action = container.action.data.initial;

  if (isSellAction(action)) {
    if (isUberTransfer(action.transfer)) {
      return DateTime.fromMillis(action.transfer.transferMillis);
    }
  }
  return container.action.data.date;
}

export const isSellAction = (action: ActionDataTypes[XferAction]["initial"]): action is ActionDataTypes["Sell"|"Bill"]["initial"] => (
  !!((action as ActionDataTypes["Sell"|"Bill"]["initial"]).transfer)
)
