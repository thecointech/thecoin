import { StateMachineProcessor } from "@thecointech/tx-statemachine";
import { graph } from "./graph";
import type { TheCoin } from '@thecointech/contract';
import type { RbcApi } from '@thecointech/rbcapi';
import { CertifiedTransfer } from '@thecointech/types';
import { getActionFromInitial } from '@thecointech/broker-db';
import { DateTime } from 'luxon';

export const Processor = (contract: TheCoin, bank: RbcApi|null = null) => new StateMachineProcessor(graph, contract, bank);

export const getBillAction = (sale: CertifiedTransfer) =>
  getActionFromInitial(sale.transfer.from, "Bill", {
    initial: sale,
    date: DateTime.fromMillis(sale.transfer.timestamp),
    initialId: sale.signature
  })
