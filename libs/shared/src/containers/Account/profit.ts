import { Transaction } from "@thecointech/tx-blockchain";
import { toHuman } from "@thecointech/utilities/Conversion";
import { weSellAt, weBuyAt, FXRate } from "@thecointech/fx-rates";

// What is the CAD value of the money coming into the account?
// If it is a purchase, it is valued at our sell rate, otherwise at our buy rate.
export const isPurchase = (tx: Transaction) => tx.from == process.env.WALLET_BrokerCAD_ADDRESS;
export const isNotFee = (tx: Transaction) => tx.to != process.env.WALLET_BrokerTransferAssistant_ADDRESS;

// What was the value of this transaction in fiat?
// NOTE: This does not convert toHuman.
export const fiatChange = (tx: Transaction, rates: FXRate[]) =>
  tx.change * (
    (tx.change > 0 && isPurchase(tx))
    ? weSellAt(rates, tx.date.toJSDate())
    : weBuyAt(rates, tx.date.toJSDate())
  )



// Calculate the amount of CAD that has been deposited, minus the amount
// that has been withdrawn.  This function filters fee's as they do not
// benefit the client (cannot be included in account base)
export const totalCad = (history: Transaction[], rates: FXRate[]) =>
  toHuman(history
    .filter(isNotFee)
    .reduce((total, tx) => total + fiatChange(tx, rates), 0)
  );

// current value is quantity * what we would pay for it
export const currentValue = (balance: number, rates: FXRate[]) =>
  toHuman(balance * weBuyAt(rates));

// Profit = current value - cost (CAD In) : that's it.
export const calculateProfit = (balance: number, history: Transaction[], rates: FXRate[]) =>
  currentValue(balance, rates) - totalCad(history, rates);
