import { StateMachineProcessor } from "@thecointech/tx-statemachine";
import { graph } from "./graph";
import type { TheCoin } from '@thecointech/contract-core';
import type { IBank } from '@thecointech/bank-interface';
import { CertifiedTransfer } from '@thecointech/types';
import { getActionFromInitial } from '@thecointech/broker-db';
import { DateTime } from 'luxon';

export { graph };
export const Processor = (contract: TheCoin, bank: IBank|null = null) => new StateMachineProcessor(graph, contract, bank);
export const getSellAction = (sale: CertifiedTransfer, date: DateTime) =>
  getActionFromInitial(sale.transfer.from, "Sell", {
    initial: sale,
    date,
    initialId: sale.signature
  })
