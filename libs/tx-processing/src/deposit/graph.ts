import { transitionTo } from "../statemachine";
import { StateGraph } from "../statemachine/types";
import * as transitions from '../transitions';

type States =
  "initial" |
  "labelledETransfer" |
  "depositReady" |
  "depositResult" |
  "deposited" |
  "converted" |
  "tcReady" |
  "tcWaiting" |
  "tcResult" |
  "error" |
  "complete";
//"refunding" |
//"refundReady";


export const graph : StateGraph<States, "Buy"> = {
  initial: {
    next: transitionTo<States, "Buy">(transitions.labelEmailETransfer, "labelledETransfer"),
  },
  labelledETransfer:{
    onTimeout: transitionTo<States>(transitions.timeout, "complete"),
    next: transitionTo<States>(transitions.preTransfer, "depositReady"),
  },

  depositReady: {
    next: transitionTo<States, "Buy">(transitions.depositFiat, "depositResult"),
  },
  depositResult: {
    // Our depositResult should be able to (eventually) handle
    // a wide range of errors automatically (eg cancelled eTransfers etc)
    onError: transitionTo<States>(transitions.requestManual, "error"),
    next: transitionTo<States, "Buy">(transitions.labelEmailDeposited, "deposited"),
  },
  deposited: {
    next: transitionTo<States>(transitions.toCoin, "converted"),
  },

  converted: {
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
