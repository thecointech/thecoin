import { StateGraph, transitionTo } from "../statemachine";
import * as transitions from '../transitions';

type States = "initial"|"fiatReady"|"fiatResult"|"convertFiat"|"tcReady"|"tcWaiting"|"tcResult"|"complete"; //|"refunding"|"refundReady";


export const graph : StateGraph<States> = {
  initial: {
    next: transitionTo(transitions.preTransfer, "fiatReady"),
    onTimeout: transitionTo(transitions.timeout, "complete"),
  },

  fiatReady: {
    next: transitionTo(transitions.depositFiat, "fiatResult"),
  },
  fiatResult: {
    next: transitionTo(transitions.toCoin, "convertFiat"),
    //onError: transitionTo(transitions.onError, "initial"),
  },

  convertFiat: {
    next: transitionTo(transitions.preTransfer, "tcReady"),
    onError: transitionTo(transitions.noop, "fiatResult"),
    onTimeout: transitionTo(transitions.timeout, "refunding"),
  },

  tcReady: {
    next: transitionTo(transitions.sendCoin, "tcWaiting"),
  },
  tcWaiting: {
    next: transitionTo(transitions.waitCoin, "tcResult"),
  },
  tcResult: {
    next: transitionTo(transitions.noop, "complete"),
    //onError: transitionTo(transitions.onError, "convertFiat"),
    //onTimeout: transitionTo(transitions.timeout, "refunding"),
  },
  // refunding: {
  //   next: transitionTo(noop, "complete"),
  // },
  // refundReady: {
  //   next: transitionTo(noop, "complete"),
  // },
  complete: null
}
