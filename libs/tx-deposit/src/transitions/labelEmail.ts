import { log } from "@thecointech/logging";
import { setETransferLabel, type Labels } from "@thecointech/tx-gmail";
import { BuyActionContainer, makeTransition } from "@thecointech/tx-statemachine";

export const labelEmailETransfer = makeTransition<"Buy">("labelEmailETransfer", (container) =>
  labelEmail(container, "etransfer")
);

export const labelEmailDeposited = makeTransition<"Buy">("labelEmailDeposited", (container) =>
  labelEmail(container, "deposited")
);
export const labelEmailRejected = makeTransition<"Buy">("labelEmailRejected", (container) =>
  labelEmail(container, "rejected")
);

async function labelEmail(container: BuyActionContainer, label: Labels) {
  const id = container.instructions?.raw?.id;
  if (!id) {
    // not fatal, but not great Either
    log.error({ initialId: container.action.data.initialId },
      "Could not mark eTransfer {initialId} with eTransfer tag, missing raw data");
    return { meta: 'Tag not set' };
  }
  await setETransferLabel(id, label);
  // No need to add anything else, all necessary data is auto-added
  return {};
}
