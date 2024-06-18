import { transitionTo, NamedTransition, StateGraph } from "@thecointech/tx-statemachine";
import * as core from '@thecointech/tx-statemachine/transitions';
import * as bills from './transitions';
import type { ActionType } from "@thecointech/broker-db";
import { retryRegisterTx } from "./transitions/retryRegisterTx";

export type ActionStates =
  "initial" |

  // First step, register the transfer
  // This registers the transfer with UberConverter
  // but the transfer will not complete
  "tcRegisterReady" |
  "tcRegisterWaiting" |

  // Error handling
  "retryRegisterTx" |

  // Tx is registered.  Wait for timestamp transferMillis
  "tcWaitToFinalize" |

  // Finalize the transfer
  "tcFinalizeInitial" | // GateKeep the transfer
  "tcFinalizeReady" |  // Start the transfer
  "tcFinalizeWaiting" | // Wait for the transfer to complete

  // convert to transferred to fiat
  "coinTransferComplete" |

  "billInitial" |
  "billReady" |
  "billResult";

export type States = ActionStates|"complete"|"cancelled";

// TODO: Can this be defined as pure data?
// Yes, yes it can...
type GraphTransitions<Type extends ActionType, States extends string> = {
  [P in States]: {
    action: NamedTransition<Type>,
    onError?: NamedTransition<Type>,
    next: States|"complete",
  }
}
export const rawGraph: GraphTransitions<'Bill', ActionStates>  = {
  initial: {
    action: core.preTransfer,
    next: "tcRegisterReady",
  },

  tcRegisterReady: {
    action: core.uberDepositCoin,
    next: "tcRegisterWaiting",
    onError: retryRegisterTx,
  },
  tcRegisterWaiting: {
    action: core.waitCoin,
    next: "tcWaitToFinalize",
    onError: retryRegisterTx,
  },

  // Error handling
  retryRegisterTx: {
    action: retryRegisterTx,
    next: "initial",
    onError: core.requestManual,
  },

  // BILLS ONLY PROCESS AFTER THE TRANSFER IS COMPLETE
  // Wait until the pending transfer is allowed.
  // Then unlock the pending fiat (add it to state)
  // This is when the nextOpenTimestamp is <= pendingTimestamp
  // This allows bills to be paid over the weekend
  tcWaitToFinalize: {
    action: core.uberWaitPending,
    next: "tcFinalizeInitial",
  },

  // transfer timestamp has passed, prepare finalize
  tcFinalizeInitial: {
    onError: core.requestManual,
    action: core.preTransfer,
    next: "tcFinalizeReady",
  },
  // Transfer pending from => to
  tcFinalizeReady: {
    onError: core.requestManual,
    action: core.uberClearPending,
    next: "tcFinalizeWaiting",
  },
  // Wait for the transfer to complete
  tcFinalizeWaiting: {
    onError: core.requestManual,
    action: core.waitCoin,
    next: "coinTransferComplete",
  },

  coinTransferComplete: {
    action: core.toFiat,
    onError: core.requestManual,
    next: "billInitial",
  },

  // Send/pay the bill.
  billInitial: {
    action: core.preTransfer,
    onError: core.requestManual,
    next: "billReady",
  },
  billReady: {
    action: bills.payBill,
    onError: core.requestManual,
    next: "billResult",
  },
  billResult: {
    onError: core.requestManual,
    action: core.markComplete,
    next: "complete",
  },
}


export const uberGraph = {
  ...Object.fromEntries(Object.entries(rawGraph).map(
    ([name, state]) => [name, {
      next: transitionTo<States, "Bill">(state.action, state.next),
      onError: state.onError ? transitionTo<States, "Bill">(state.onError, (state.onError.transitionName) as States) : undefined,
    }])
  ),
  requestManual: {
    next: core.manualOverride,
  },
  // error: {
  //   next: core.manualOverride,
  // },
  cancelled: {
    next: transitionTo<States, "Bill">(core.markComplete, 'complete'),
  },
  complete: null,
} as any as StateGraph<States, "Bill">


// // Original Version - it's icky
// export const graph : StateGraph<States, "Bill"> = {
//   initial: {
//     next: transitionTo<States>(core.preTransfer, "tcPendingReady"),
//   },

//   // Send the UberTransfer
//   // This simply records the transfer as Pending on the blockchain
//   tcPendingReady: {
//     onError: transitionTo<States>(core.requestManual, "error"),
//     next: transitionTo<States, "Bill">(core.uberDepositCoin, "tcPendingWaiting"),
//   },
//   tcPendingWaiting: {
//     onError: transitionTo<States>(core.requestManual, "error"),
//     next: transitionTo<States>(core.waitCoin, "addPendingFiat"),
//   },

//   // Wait until the pending transfer is allowed.
//   // Then unlock the pending fiat (add it to state)
//   // This is when the nextOpenTimestamp is <= pendingTimestamp
//   // This allows bills to be paid over the weekend
//   addPendingFiat: {
//     onError: transitionTo<States>(core.requestManual, "error"),
//     next: transitionTo<States, "Bill">(core.uberUnlockPendingFiat, "billReady"),
//   },

//   // Send/pay the bill.
//   billReady: {
//     onError: transitionTo<States>(core.requestManual, "error"),
//     next: transitionTo<States, "Bill">(bills.payBill, "billResult"),
//   },
//   // After result, we wait until the pending transfer timestamp has passed
//   billResult: {
//     onError: transitionTo<States>(core.requestManual, "error"),
//     next: transitionTo<States, "Bill">(core.uberWaitPending, "tcFinalInitial"),
//   },

//   tcFinalInitial: {
//     onError: transitionTo<States>(core.requestManual, "error"),
//     next: transitionTo<States>(core.preTransfer, "tcFinalReady"),
//   },
//   // Transfer pending from => to
//   tcFinalReady: {
//     onError: transitionTo<States>(core.requestManual, "error"),
//     next: transitionTo<States, "Bill">(core.uberClearPending, "tcFinalWaiting"),
//   },
//   // Wait for the pending transfer to complete
//   tcFinalWaiting: {
//     onError: transitionTo<States>(core.requestManual, "error"),
//     next: transitionTo<States>(core.waitCoin, "tcFinalResult"),
//   },
//   // This may neeed a bit more logic.
//   tcFinalResult: {
//     onError: transitionTo<States>(core.requestManual, "error"),
//     next: transitionTo<States>(core.toFiat, "complete"),
//   },

//   error: {
//     next: core.manualOverride,
//   },
//   complete: null
// }
