import { CertifiedActionVerify } from './CertifiedActionVerify';
import { CertifiedTransfer } from '@thecointech/types';
import { createAction } from '@thecointech/broker-db/transaction';
import { DateTime } from 'luxon';
import { Processor } from "@thecointech/tx-processing/etransfer";
import { GetContract } from '@thecointech/contract/contract';
import { getCurrentState } from '@thecointech/tx-processing/statemachine/types';
import { DocumentReference } from '@thecointech/firestore';

export type VerifiedActionResult = {
	doc: DocumentReference,
	hash: string
}

export async function  DoCertifiedSale(sale: CertifiedTransfer) {

  const signer = await CertifiedActionVerify(sale);
  const contract = await GetContract();
  // First, create/register the action
  const action = await createAction(signer, "Sell", {
    initial: sale,
    date: DateTime.now(),
    initialId: sale.signature
  })

  const processor = Processor(contract);
  const container = await processor.execute(null, action, "tcWaiting");
  const latestState = getCurrentState(container);

  return {
    doc: action.doc,
    hash: latestState.data.hash
  }
}
