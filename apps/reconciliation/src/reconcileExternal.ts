//
// Reconcile transactions from external sources.
//

import { AllData, ReconciledRecord, Reconciliations } from "types";
import  { weBuyAt, weSellAt } from '@the-coin/shared/containers/FxRate'
import { spliceBank } from "./matchBank";
import { UserAction } from "@the-coin/utilities/User";
import { Timestamp } from "@the-coin/utilities/firestore";
import { spliceEmail } from "./matchEmails";
import { toHuman } from "@the-coin/utilities";
import { getOrCreateUser } from "./utils";

export function reconcileExternal(data: AllData) {

  // First, we review blockchain transactions to see if we can match any to email/bank
  const newEntries = reconcileBlockchain(data);
  return newEntries;
}

function reconcileBlockchain(data: AllData) {
  return data.blockchain.reduce((r, bc) => {
    // What was this transactions value in CAD
    const action: UserAction = bc.change > 0 ? "Sell" : "Buy";
    const cad = toHuman(bc.change * (
      action == "Buy"
        ? weSellAt(data.rates, bc.date.toJSDate()) * -1
        : weBuyAt(data.rates, bc.date.toJSDate())
      )
    , true);
    const user = getOrCreateUser(r, bc.counterPartyAddress);

    const dt = Timestamp.fromMillis(bc.date.toMillis());
    const record: ReconciledRecord = {
      action,
      data: {
        confirmed: true,
        hash: bc.txHash!,
        recievedTimestamp: dt,
        completedTimestamp: dt,
        fiatDisbursed: cad,
        transfer: { value: bc.change },
      },
      blockchain: bc,
    } as ReconciledRecord;
    // is there any bank transaction that matches this amount?
    record.bank = spliceBank(data, user, record, 5)
    record.email = spliceEmail(data, user, record, 30);

    user.transactions.push(record);
    return r;
  }, []as Reconciliations);
}

