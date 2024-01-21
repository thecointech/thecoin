import Decimal from "decimal.js-light";
import { DateTime } from "luxon";
import { TypedActionContainer, getCurrentState } from "../types";
import { FXRate, GetRatesApi } from '@thecointech/apis/pricing';
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
  const settledOn = await getSettledAt(container);
  log.debug(`Conversion - settledOn: ${settledOn}`);

  if (DateTime.now() <= settledOn)
    return null;

  const convertAt = await getConvertAt(settledOn);
  if (!convertAt) return { error: `Failed fetching exchange rate for ${settledOn}` };

  log.debug(`Conversion - convertAt: ${convertAt.fxRate * convertAt.sell}`);

  return {
    date: settledOn,
    [from]: new Decimal(0),
    [to]: multiplier(fromValue, convertAt),
  }
}

// Fetch conversion rate from server
async function getConvertAt(date: DateTime) {
  const ratesApi = GetRatesApi();
  const rate = await ratesApi.getSingle(124, date.toMillis());
  if (rate.status != 200 || !rate.data.sell) {
    log.error(`Error fetching rate for: ${date}`);
    return false;
  }
  return rate.data;
  // const { buy, sell, fxRate } = rate.data;
  // return fxRate * (from == "fiat" ? sell : buy);
}

async function getSettledAt(container: TypedActionContainer<XferAction>) {
  const action = container.action.data.initial;
  const requestDate = container.action.data.date;

  if (isSellAction(action)) {
    if (isUberTransfer(action.transfer)) {
      // For future-dated transfers we take the exact timestamp
      return DateTime.fromMillis(action.transfer.transferMillis);
    }
  }
  // For immediate transfers, we just take the next open timestamp
  const nextOpen = await nextOpenTimestamp(requestDate);
  return DateTime.fromMillis(nextOpen)
}

export const isSellAction = (action: ActionDataTypes[XferAction]["initial"]): action is ActionDataTypes["Sell"|"Bill"]["initial"] => (
  !!((action as ActionDataTypes["Sell"|"Bill"]["initial"]).transfer)
)
