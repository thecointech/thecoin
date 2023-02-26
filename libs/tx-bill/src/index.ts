import { StateMachineProcessor } from "@thecointech/tx-statemachine";
import { graph } from "./graph";
import type { TheCoin } from '@thecointech/contract-core';
import type { IBank } from '@thecointech/bank-interface';
import { CertifiedTransfer } from '@thecointech/types';
import { getActionFromInitial } from '@thecointech/broker-db';
import { DateTime } from 'luxon';
import { uberGraph } from './uberGraph';

export { graph };
export const CertifiedProcessor = (contract: TheCoin, bank: IBank|null = null) => new StateMachineProcessor(graph, contract, bank);
export const UberProcessor = (contract: TheCoin, bank: IBank|null = null) => new StateMachineProcessor(uberGraph, contract, bank);

export const getBillAction = (sale: CertifiedTransfer) =>
  getActionFromInitial(sale.transfer.from, "Bill", {
    initial: sale,
    date: DateTime.fromMillis(sale.transfer.timestamp),
    initialId: sale.signature
  })
