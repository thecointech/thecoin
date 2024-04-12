import { transitionTo, StateGraph } from "@thecointech/tx-statemachine";
import * as core from '@thecointech/tx-statemachine/transitions';
import * as deposit from './transitions';

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
  "cancelled" |
  "complete";
//"refunding" |
//"refundReady";


export const etransfer : StateGraph<States, "Buy"> = {
  initial: {
    next: transitionTo<States, "Buy">(deposit.labelEmailETransfer, "labelledETransfer"),
  },
  labelledETransfer:{
    onTimeout: transitionTo<States>(core.timeout, "complete"),
    next: transitionTo<States>(core.preTransfer, "depositReady"),
  },

  depositReady: {
    next: transitionTo<States, "Buy">(deposit.depositFiat, "depositResult"),
  },
  depositResult: {
    // Our depositResult should be able to (eventually) handle
    // a wide range of errors automatically (eg cancelled eTransfers etc)
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States, "Buy">(deposit.labelEmailDeposited, "deposited"),
  },
  deposited: {
    next: transitionTo<States, "Buy">(core.toCoin, "converted"),
  },

  converted: {
    onError: transitionTo<States>(core.requestManual, "error"),
    onTimeout: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.preTransfer, "tcReady"),
  },

  tcReady: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.sendCoin, "tcWaiting"),
  },
  tcWaiting: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.waitCoin, "tcResult"),
  },
  tcResult: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.markComplete, "complete"),
  },

  // refunding: {
  //   next: transitionTo(noop, "complete"),
  // },
  // refundReady: {
  //   next: transitionTo(noop, "complete"),
  // },
  error: {
    next: core.manualOverride,
  },
  cancelled: {
    next: transitionTo<States>(core.markComplete, 'complete'),
  },
  complete: null
}
