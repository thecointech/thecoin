import { Transaction } from "./types";
import { weSellAt, weBuyAt, FXRate } from "../FxRate";

// What is the CAD value of the money coming into the account?
// If it is a purchase, it is valued at our sell rate, otherwise at our buy rate.
const isPurchase = (tx: Transaction) =>
  tx.logEntry.startsWith("Purchase: ")

// What was
export const fiatChange = (tx: Transaction, rates: FXRate[]) =>
  tx.change * (
    (tx.change > 0 && isPurchase(tx))
    ? weSellAt(rates, tx.date)
    : weBuyAt(rates, tx.date)
  )

export const filterFeesFiatChange = (tx: Transaction, rates: FXRate[]) =>
    tx.logEntry == "Transfer: 0x51e1153eE05efCf473d581c15b3F7B760CA5Ddb3"
    ? 0
    : fiatChange(tx, rates);

// Calculate the amount of CAD that has been deposited, minus the amount
// that has been withdrawn.  This function filters fee's as they are not a withdrawal
export const totalCad = (history: Transaction[], rates: FXRate[]) =>
  // 'Reduce' collapses an array down into a single value
  history.reduce((total, tx) => total + filterFeesFiatChange(tx, rates), 0)

// current value is quantity * what we would pay for it
export const currentValue = (balance: number, rates: FXRate[]) =>
  balance * weBuyAt(rates);

// Profit = current value - cost (CAD In) : that's it.
export const calculateProfit = (balance: number, history: Transaction[], rates: FXRate[]) =>
  currentValue(balance, rates) - totalCad(history, rates);
