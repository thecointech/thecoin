import { transitionTo } from "../statemachine";
import { StateGraph } from "../statemachine/types";
import * as transitions from '../transitions';

type States =
  "initial" |
  "depositReady" |
  "depositResult" |
  "convertFiat" |
  "tcReady" |
  "tcWaiting" |
  "tcResult" |
  "error" |
  "complete";
//"refunding" |
//"refundReady";


export const graph : StateGraph<States> = {
  initial: {
    onTimeout: transitionTo<States>(transitions.timeout, "complete"),
    next: transitionTo<States>(transitions.preTransfer, "depositReady"),
  },

  depositReady: {
    next: transitionTo<States>(transitions.depositFiat, "depositResult"),
  },
  depositResult: {
    // Our depositResult should be able to (eventually) handle
    // a wide range of errors automatically (eg cancelled eTransfers etc)
    onError: transitionTo<States>(transitions.requestManual, "error"),
    next: transitionTo<States>(transitions.toCoin, "convertFiat"),
  },

  convertFiat: {
    onError: transitionTo<States>(transitions.requestManual, "error"),
    onTimeout: transitionTo<States>(transitions.requestManual, "error"),
    next: transitionTo<States>(transitions.preTransfer, "tcReady"),
  },

  tcReady: {
    onError: transitionTo<States>(transitions.requestManual, "error"),
    next: transitionTo<States>(transitions.sendCoin, "tcWaiting"),
  },
  tcWaiting: {
    onError: transitionTo<States>(transitions.requestManual, "error"),
    next: transitionTo<States>(transitions.waitCoin, "tcResult"),
  },
  tcResult: {
    onError: transitionTo<States>(transitions.requestManual, "error"),
    next: transitionTo<States>(transitions.markComplete, "complete"),
  },
  // refunding: {
  //   next: transitionTo(noop, "complete"),
  // },
  // refundReady: {
  //   next: transitionTo(noop, "complete"),
  // },
  error: null,
  complete: null
}
