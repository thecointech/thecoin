import { transitionTo, StateGraph } from "@thecointech/tx-statemachine";
import * as core from '@thecointech/tx-statemachine/transitions';
import { handleRequest } from './transitions/handleRequest';

type States =
  "initial" |

  "tcReady" |
  "tcWaiting" |
  "tcResult" |

  "error" |
  "complete";

export const graph : StateGraph<States, "Plugin"> = {
  initial: {
    next: transitionTo<States>(core.preTransfer, "tcReady"),
  },

  tcReady: {
    onError: transitionTo<States>(core.requestManual, "error"),
    next: transitionTo<States, "Plugin">(handleRequest, "tcWaiting"),
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
}
