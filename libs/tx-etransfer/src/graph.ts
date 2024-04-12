import { transitionTo, StateGraph } from "@thecointech/tx-statemachine";
import * as core from '@thecointech/tx-statemachine/transitions';
import * as eTransfer from './transitions';

type States =
  "initial" |

  "tcReady" |
  "tcWaiting" |
  "tcResult" |

  "converted" |

  "eTransferReady" |
  "eTransferResult" |

  "error" |
  "complete";
//"refunding" |
//"refundReady";


export const graph : StateGraph<States, "Sell"> = {
  initial: {
    next: transitionTo<States>(core.preTransfer, "tcReady"),
  },

  tcReady: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States, "Sell"|"Bill">(core.depositCoin, "tcWaiting"),
  },
  tcWaiting: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.waitCoin, "tcResult"),
  },
  tcResult: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States, "Sell">(core.toFiat, "converted"),
  },

  converted: {
    onError: transitionTo<States>(core.requestManual, "error"),
    onTimeout: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.preTransfer, "eTransferReady"),
  },

  eTransferReady: {
    next: transitionTo<States, "Sell">(eTransfer.sendETransfer, "eTransferResult"),
  },
  eTransferResult: {
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
  complete: null,
}
