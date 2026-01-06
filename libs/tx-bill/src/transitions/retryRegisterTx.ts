import { makeTransition } from "@thecointech/tx-statemachine";
import { log } from '@thecointech/logging';

//
// Something has gone wrong, we can re-try automatically
// before falling back to manual attention.
export const retryRegisterTx = makeTransition("retryRegisterTx", async (action) => {
  // How many times have we had this error?
  const { history } = action;
  const errors = history.filter(h => h.delta.error);
  // For now, only tolerate a single error
  if (errors.length != 1) {
    return { error: `Too many errors: ${errors.length}`}
  }
  // And that error has to be the right type.
  if (!errors[0].delta.error?.startsWith("execution reverted:")) {
    return { error: `Unknown Error`}
  }
  // But we have minimum back-off time
  const minsSinceError = errors[0].delta.created.diffNow().as("minutes");
  if (minsSinceError > -15) { // NOTE: -15 is 15 minutes ago
    log.debug({ initialId: action.action.data.initialId }, "Waiting before retrying transaction");
    return null;
  }

  log.info({ initialId: action.action.data.initialId }, "Retrying transaction");
  // Ok - we can re-try.
  return {
    error: ''
  };
});
