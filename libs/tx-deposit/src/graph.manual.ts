import { transitionTo, StateGraph } from "@thecointech/tx-statemachine";
import * as core from '@thecointech/tx-statemachine/transitions';
import { makeDeposit, Deposit } from './transitions/depositFiatManual';

type States =
  "initial" |
  "deposited" |
  "converted" |
  "tcReady" |
  "tcWaiting" |
  "tcResult" |
  "error" |
  "complete";

export type { Deposit };

export const manual = (deposit: Deposit): StateGraph<States, "Buy"> => ({
  initial: {
    next: transitionTo<States, "Buy">(makeDeposit(deposit), "deposited"),
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

  error: {
    next: core.manualOverride,
  },
  complete: null
})
