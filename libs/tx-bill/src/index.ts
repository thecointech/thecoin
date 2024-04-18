import { StateMachineProcessor } from '@thecointech/tx-statemachine';
import type { TheCoin } from '@thecointech/contract-core';
import type { IBank } from '@thecointech/bank-interface';
import { getActionFromInitial } from '@thecointech/broker-db';
import { DateTime } from 'luxon';
import { graph } from './graph';
import { uberGraph } from './uberGraph';
import { CertifiedTransfer, CertifiedTransferRequest, UberTransfer } from '@thecointech/types';
import { isCertTransfer } from '@thecointech/utilities/VerifiedTransfer';

export { graph, uberGraph };
export const CertifiedProcessor = (contract: TheCoin, bank: IBank | null = null) => new StateMachineProcessor(graph, contract, bank);
export const UberProcessor = (contract: TheCoin, bank: IBank | null = null) => new StateMachineProcessor(uberGraph, contract, bank);
export const Processor = (transfer: CertifiedTransferRequest | UberTransfer, contract: TheCoin, bank: IBank | null = null) => (
  isCertTransfer(transfer)
    ? CertifiedProcessor(contract, bank)
    : UberProcessor(contract, bank)
);
export const getBillAction = (sale: CertifiedTransfer) => getActionFromInitial(sale.transfer.from, 'Bill', {
  initial: sale,
  date: DateTime.fromMillis(sale.transfer.timestamp),
  initialId: sale.signature,
});
