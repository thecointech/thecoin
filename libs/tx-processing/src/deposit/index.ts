import { getActionFromInitial } from "@thecointech/broker-db";
import { StateMachineProcessor } from "../statemachine";
import { graph } from "./graph";
import type { TheCoin } from '@thecointech/contract';
import type { eTransferData } from "@thecointech/tx-gmail";
import type { RbcApi } from '@thecointech/rbcapi';

export const Processor = (contract: TheCoin, bank: RbcApi|null = null) => new StateMachineProcessor(graph, contract, bank);

//
// For each deposit email, either find an existing incomplete action
// or create a new action for the data
export async function getBuyAction(etransfer: eTransferData) {
  const {id, address, cad } = etransfer;
  // We assume (for now) that id is unique amongst all eTransfers
  return getActionFromInitial(address, "Buy", {
    initial: {
      amount: cad,
      type: 'etransfer',
    },
    date: etransfer.recieved,
    initialId: id,
  })
}
