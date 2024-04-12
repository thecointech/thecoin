import { transitionTo, StateGraph } from "@thecointech/tx-statemachine";
import * as core from '@thecointech/tx-statemachine/transitions';
import * as bills from './transitions';

type States =
  "initial" |

  "tcReady" |
  "tcWaiting" |
  "tcResult" |

  "converted" |

  "billReady" |
  "billResult" |

  "error" |
  "complete";

export const graph : StateGraph<States, "Bill"> = {
  initial: {
    next: transitionTo<States>(core.preTransfer, "tcReady"),
  },

  tcReady: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States, "Bill">(core.depositCoin, "tcWaiting"),
  },
  tcWaiting: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.waitCoin, "tcResult"),
  },
  tcResult: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States, "Bill">(core.toFiat, "converted"),
  },

  converted: {
    onError: transitionTo<States>(core.requestManual, "error"),
    onTimeout: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.preTransfer, "billReady"),
  },

  billReady: {
    next: transitionTo<States, "Bill">(bills.payBill, "billResult"),
  },
  billResult: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States>(core.markComplete, "complete"),
  },
  error: {
    next: core.manualOverride,
  },
  complete: null
}
