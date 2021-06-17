import { TypedActionContainer } from "../statemachine/types";

//
// Attempt to apply the fiat balance to billing details
// If successfull will reset the fiat balance to 0
export async function etransferCancelled(_container: TypedActionContainer<"Sell">) {
  // TODO: Automated bill payments
  return null
}
