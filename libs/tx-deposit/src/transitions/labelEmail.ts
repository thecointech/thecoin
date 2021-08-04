import { log } from "@thecointech/logging";
import { setETransferLabel, Labels } from "@thecointech/tx-gmail";
import { BuyActionContainer } from "@thecointech/tx-statemachine";

export async function labelEmailETransfer(container: BuyActionContainer) {
  return await labelEmail(container, "etransfer");
}
export async function labelEmailDeposited(container: BuyActionContainer) {
  return await labelEmail(container, "deposited");
}
export async function labelEmailRejected(container: BuyActionContainer) {
  return await labelEmail(container, "rejected");
}

async function labelEmail(container: BuyActionContainer, label: Labels) {
  const raw = container.instructions?.raw;
  if (!raw) {
    // not fatal, but not great Either
    log.error({ initialId: container.action.data.initialId },
      "Could not mark eTransfer {initialId} with eTransfer tag, missing raw data");
    return { meta: 'Tag not set' };
  }
  await setETransferLabel(raw, label);
  // No need to add anything else, all necessary data is auto-added
  return {};
}
