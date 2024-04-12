import { AssignPluginRequest } from '@thecointech/types';
import { buildConverter, convertDecimal, convertDates, serverTimestamp } from "../converter";
import { ActionDataTypes, TransitionDelta, IncompleteRef } from "./types";

export const incompleteConverter = buildConverter<IncompleteRef>();
export const transitionConverter = buildConverter<TransitionDelta>(
  convertDates<TransitionDelta>("date"),
  serverTimestamp<TransitionDelta>("created"),
  convertDecimal<TransitionDelta>("fiat", "coin"),
);
export const buyActionConverter = buildConverter<ActionDataTypes["Buy"]>(
  convertDates<ActionDataTypes["Buy"]>("date"),
  convertDecimal<ActionDataTypes["Buy"]["initial"]>("amount"),
);
export const sellActionConverter = buildConverter<ActionDataTypes["Sell"]>(
  convertDates<ActionDataTypes["Sell"]>("date"),
);
export const billActionConverter = buildConverter<ActionDataTypes["Bill"]>(
  convertDates<ActionDataTypes["Bill"]>("date"),
);
export const pluginActionConverter = buildConverter<ActionDataTypes["Plugin"]>(
  convertDates<ActionDataTypes["Plugin"]>("date"),
  convertDates<ActionDataTypes["Plugin"]["initial"]>("signedAt"),
  // timeMs only exists on AssignPluginRequest, so needs it's own converter
  convertDates<AssignPluginRequest>("timeMs"),
);
export const heartbeatActionConverter = buildConverter<ActionDataTypes["Heartbeat"]>(
  convertDates<ActionDataTypes["Heartbeat"]>("date"),
)

export const actionConverters = {
  Buy: buyActionConverter,
  Sell: sellActionConverter,
  Bill: billActionConverter,
  Plugin: pluginActionConverter,
  Heartbeat: heartbeatActionConverter,
}
