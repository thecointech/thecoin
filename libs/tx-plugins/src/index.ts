import { StateMachineProcessor } from '@thecointech/tx-statemachine';
import type { TheCoin } from '@thecointech/contract-core';
import { graph } from './graph';

export { graph };
export const Processor = (contract: TheCoin) => new StateMachineProcessor(graph, contract, null);
// export const getPluginAction = (sale: CertifiedTransfer) => getActionFromInitial(sale.transfer.from, 'Bill', {
//   initial: sale,
//   date: DateTime.fromMillis(sale.transfer.timestamp),
//   initialId: sale.signature,
// });
