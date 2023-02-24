import { transitionTo, StateGraph } from "@thecointech/tx-statemachine";
import * as core from '@thecointech/tx-statemachine/transitions';
import * as bills from './transitions';

type States =
  "initial" |

  "tcPendingReady" |
  "tcPendingWaiting" |
  // "tcPendingResult" |

  "addPendingFiat" |

  "billReady" |
  "billResult" |

  // Finalize the transfer
  "tcFinalInitial" | // GateKeep the transfer
  "tcFinalReady" |  // Start the transfer
  "tcFinalWaiting" | // Wait for the transfer to complete
  "tcFinalResult" | // convert to fiat, apply vs pending

  // Do we need to apply a converted here?
  // "converted" |

  "error" |
  "complete";

export const graph : StateGraph<States, "Bill"> = {
  initial: {
    next: transitionTo<States>(core.preTransfer, "tcPendingReady"),
  },

  // Send the UberTransfer
  // This simply records the transfer as Pending on the blockchain
  tcPendingReady: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States, "Bill">(core.uberDepositCoin, "tcPendingWaiting"),
  },
  tcPendingWaiting: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.waitCoin, "addPendingFiat"),
  },

  // Wait until the pending transfer is allowed.
  // Then unlock the pending fiat (add it to state)
  // This is when the nextOpenTimestamp is <= pendingTimestamp
  // This allows bills to be paid over the weekend
  addPendingFiat: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.uberUnlockPendingFiat, "billReady"),
  },

  // Send/pay the bill.
  billReady: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States, "Bill">(bills.payBill, "billResult"),
  },
  // After result, we wait until the pending transfer timestamp has passed
  billResult: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.uberWaitPending, "tcFinalInitial"),
  },

  tcFinalInitial: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.preTransfer, "tcFinalReady"),
  },
  // Transfer pending from => to
  tcFinalReady: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States, "Bill">(core.uberClearPending, "tcFinalWaiting"),
  },
  // Wait for the pending transfer to complete
  tcFinalWaiting: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.waitCoin, "tcFinalResult"),
  },
  // This may neeed a bit more logic.
  tcFinalResult: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.toFiat, "complete"),
  },

  error: {
    next: core.manualOverride,
  },
  complete: null
}
