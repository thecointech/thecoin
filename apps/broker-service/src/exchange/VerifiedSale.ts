import { CertifiedActionVerify } from './CertifiedActionVerify';
import { CertifiedTransfer } from '@thecointech/types';
import { createAction } from '@thecointech/broker-db/transaction';
import { DateTime } from 'luxon';
import { Processor } from "@thecointech/tx-processing/etransfer";
import { GetContract } from './Wallet';
import { getCurrentState } from '@thecointech/tx-processing/statemachine/types';
import { DocumentReference } from '@thecointech/firestore';
import { SendMail } from '@thecointech/email/';
import { log } from '@thecointech/logging';

export type VerifiedActionResult = {
	doc: DocumentReference,
	hash: string
}

export async function  DoCertifiedSale(sale: CertifiedTransfer) {
  try {
    const user = await CertifiedActionVerify(sale);
    log.trace({user, intialId: sale.signature },
      `Processing sale from {user} with initialId {initialId}`);
    const contract = await GetContract();
    // First, create/register the action
    const action = await createAction(user, "Sell", {
      initial: sale,
      date: DateTime.now(),
      initialId: sale.signature
    })

    const processor = Processor(contract);
    const container = await processor.execute(null, action, "tcWaiting");
    const latestState = getCurrentState(container);

    // For now, keep sending the emails on every transaction.
    SendMail(`Coin Sell`, `${container.action.address} processed states:\n
      ${action.history.map(h => h.type).join('\n')}\n
       => ${latestState.name}`
    );

    return {
      doc: action.doc,
      hash: latestState.data.hash
    }
  }
  catch (err) {
    // For now, keep sending the emails on every transaction.
    SendMail(`Coin Sell Error`, err.message);
    return { error: "Server Error" };
  }
}
