import { buildConverter, convertDecimal, convertDates } from "../converter";
import { ActionDataTypes, TransitionDelta, IncompleteRef } from "./types";

export const incompleteConverter = buildConverter<IncompleteRef>();
export const transitionConverter = buildConverter<TransitionDelta>(
  convertDates<TransitionDelta>("date"),
  convertDecimal<TransitionDelta>("fiat", "coin"),
);
export const buyActionConverter = buildConverter<ActionDataTypes["Buy"]>(
  convertDates<ActionDataTypes["Buy"]>("date"),
  convertDecimal<ActionDataTypes["Buy"]["initial"]>("amount"),
);
export const sellActionConverter = buildConverter<ActionDataTypes["Sell"]>(
  convertDates<ActionDataTypes["Sell"]>("date"),
  convertDecimal("amount") // initial.amount
);
export const billActionConverter = buildConverter<ActionDataTypes["Bill"]>(
  convertDates<ActionDataTypes["Sell"]>("date"),
  convertDecimal("amount") // initial.amount
);

export const actionConverters = {
  Buy: buyActionConverter,
  Sell: sellActionConverter,
  Bill: billActionConverter,
}
