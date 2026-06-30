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
  "eTransferSent" |
  "eTransferComplete" |

  "revertBegin" |
  "revertConverted" |
  "revertReady" |
  "revertWaiting" |
  "revertComplete" |

  "error" |
  "complete" |
  "cancelled";

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

  // Before sending eTransfer
  eTransferReady: {
    next: transitionTo<States, "Sell">(eTransfer.sendETransfer, "eTransferSent"),
  },
  // The transfer has been sent
  eTransferSent: {
    // An error with sending the transfer - admin needs to figure out what went wrong here.
    onError: transitionTo<States>(core.requestManual, "error"),
    // wait for user to deposit it before move forward to `eTransferComplete`
    next: transitionTo<States, "Sell">(eTransfer.waitETransfer, "eTransferComplete"),
  },
  // Transfer has been deposited/or failed.
  eTransferComplete: {
    // Waiting went wrong (timed out?)
    onError: transitionTo<States, "Sell">(eTransfer.handleWaitError, "revertBegin"),
    // If deposited, mark complete.
    next: transitionTo<States>(core.markComplete, "complete"),
  },

  // Revert reverse the coin transaction "only"
  revertBegin: {
    // handleWaitError didn't find an error it could handle, pass back to human.
    onError: transitionTo<States>(core.requestManual, "error"),
    // Otherwise, transfer away.
    next: transitionTo<States, "Sell">(core.toCoin, "revertConverted"),
  },
  revertConverted: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States, "Sell">(core.preTransfer, "revertReady"),
  },
  revertReady: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States, "Sell">(core.sendCoin, "revertWaiting"),
  },
  revertWaiting: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States, "Sell">(core.waitCoin, "revertComplete"),
  },
  revertComplete: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.markComplete, "complete"),
  },


  error: {
    next: core.manualOverride,
  },
  cancelled: {
    next: transitionTo<States>(core.markComplete, 'complete'),
  },
  complete: null,
}
