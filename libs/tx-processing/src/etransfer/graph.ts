import { transitionTo } from "../statemachine";
import { StateGraph } from "../statemachine/types";
import * as transitions from '../transitions';

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
    next: transitionTo<States>(transitions.preTransfer, "tcReady"),
  },

  tcReady: {
    onError: transitionTo<States>(transitions.requestManual, "error"),
    next: transitionTo<States, "Sell"|"Bill">(transitions.depositCoin, "tcWaiting"),
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
    next: transitionTo<States>(transitions.preTransfer, "eTransferReady"),
  },

  eTransferReady: {
    next: transitionTo<States, "Sell">(transitions.sendETransfer, "eTransferResult"),
  },
  eTransferResult: {
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
