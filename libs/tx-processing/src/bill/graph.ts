import { transitionTo } from "../statemachine";
import { StateGraph } from "../statemachine/types";
import * as transitions from '../transitions';

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
    next: transitionTo<States>(transitions.preTransfer, "tcReady"),
  },

  tcReady: {
    onError: transitionTo<States>(transitions.requestManual, "error"),
    next: transitionTo<States, "Bill">(transitions.depositCoin, "tcWaiting"),
  },
  tcWaiting: {
    onError: transitionTo<States>(transitions.requestManual, "error"),
    next: transitionTo<States>(transitions.waitCoin, "tcResult"),
  },
  tcResult: {
    onError: transitionTo<States>(transitions.requestManual, "error"),
    next: transitionTo<States>(transitions.toFiat, "converted"),
  },

  converted: {
    onError: transitionTo<States>(transitions.requestManual, "error"),
    onTimeout: transitionTo<States>(transitions.requestManual, "error"),
    next: transitionTo<States>(transitions.preTransfer, "billReady"),
  },

  billReady: {
    next: transitionTo<States, "Bill">(transitions.doBillPayment, "billResult"),
  },
  billResult: {
    onError: transitionTo<States>(transitions.requestManual, "error"),
    next: transitionTo<States>(transitions.markComplete, "complete"),
  },
  error: null,
  complete: null
}
