import { TypedActionContainer } from "../types";

//
// Attempt to apply the fiat balance to billing details
// If successfull will reset the fiat balance to 0
export async function doBillPayment(_container: TypedActionContainer<"Bill">) {
  // TODO: Automated bill payments
  return null
}
