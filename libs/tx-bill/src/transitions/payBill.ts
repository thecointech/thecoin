import { BillActionContainer, TransitionCallback } from "@thecointech/tx-statemachine";
import { verifyPreTransfer } from "@thecointech/tx-statemachine/transitions";

//
// Process a bill payment
export const payBill: TransitionCallback<"Bill"> = async (container) =>
  verifyPreTransfer(container) ?? await doPayBill(container);

const doPayBill: TransitionCallback<"Bill"> = (_container: BillActionContainer) => {
  throw ("Not Implemented");
}
