import { getActionFromInitial, PurchaseType } from "@thecointech/broker-db";
import { StateMachineProcessor } from "@thecointech/tx-statemachine";
import { etransfer } from "./graph.etransfer";
import { manual, Deposit } from "./graph.manual";
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';

import type { TheCoin } from '@thecointech/contract-core';
import type { eTransferData } from "@thecointech/tx-gmail";
import type { IBank } from '@thecointech/bank-interface';
export { etransfer, manual };

// deposit eTransfers
export const eTransferProcessor = (contract: TheCoin, bank: IBank | null = null) => new StateMachineProcessor(etransfer, contract, bank);
// Used to handle deposits/other.
export const manualProcessor = (contract: TheCoin, deposit: Deposit) => new StateMachineProcessor(manual(deposit), contract, null);

//
// For each deposit email, either find an existing incomplete action
// or create a new action for the data
export async function getBuyETransferAction(etransfer: eTransferData) {
  // We assume (for now) that id is unique amongst all eTransfers
  const { id, address, cad, recieved } = etransfer;
  const action = await getBuyTypeAction("etransfer", address, cad, recieved, id)
  action.data.initial.raw = etransfer;
  return action;
}

//
// E-Transfers come with their own ID, but direct deposit/wages
// do not.  We build an ID unique (for a client) based on the ingredients
export const buildBuyId = (type: string, cad: Decimal, date: DateTime) =>
   `${type}:${cad.toString()}:${date.toMillis()}`

//
// generic buy-action constructor.
export function getBuyTypeAction(type: PurchaseType, address: string, cad: Decimal, date: DateTime, id?: string) {
  // We assume (for now) that id is unique amongst all eTransfers
  const initialId = id ?? buildBuyId(type, cad, date)
  return getActionFromInitial(address, "Buy", {
    initial: {
      amount: cad,
      type,
    },
    date,
    initialId,
  })
}
