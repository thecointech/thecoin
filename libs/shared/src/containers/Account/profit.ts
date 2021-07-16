import { Transaction } from "@thecointech/tx-blockchain";
import { toHuman } from "@thecointech/utilities";
import { weSellAt, weBuyAt, FXRate } from "@thecointech/fx-rates";

// What is the CAD value of the money coming into the account?
// If it is a purchase, it is valued at our sell rate, otherwise at our buy rate.
const isPurchase = (tx: Transaction) =>
  tx.logEntry.startsWith("Purchase: ")

// What was the value of this transaction in fiat?
// NOTE: This does not convert toHuman.
export const fiatChange = (tx: Transaction, rates: FXRate[]) =>
  tx.change * (
    (tx.change > 0 && isPurchase(tx))
    ? weSellAt(rates, tx.date.toJSDate())
    : weBuyAt(rates, tx.date.toJSDate())
  )


export const filterFees = (tx: Transaction) => tx.logEntry != "Transfer: 0x51e1153eE05efCf473d581c15b3F7B760CA5Ddb3";

// Calculate the amount of CAD that has been deposited, minus the amount
// that has been withdrawn.  This function filters fee's as they do not
// benefit the client (cannot be included in account base)
export const totalCad = (history: Transaction[], rates: FXRate[]) =>
  toHuman(history
    .filter(filterFees)
    .reduce((total, tx) => total + fiatChange(tx, rates), 0)
  );

// current value is quantity * what we would pay for it
export const currentValue = (balance: number, rates: FXRate[]) =>
  toHuman(balance * weBuyAt(rates));

// Profit = current value - cost (CAD In) : that's it.
export const calculateProfit = (balance: number, history: Transaction[], rates: FXRate[]) =>
  currentValue(balance, rates) - totalCad(history, rates);
