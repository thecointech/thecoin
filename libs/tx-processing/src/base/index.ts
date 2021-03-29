import { IFxRates } from "@thecointech/shared/containers/FxRate";
import { GetFirestore, CertifiedTransferRecord } from "@thecointech/utilities/firestore";
import { decryptTo } from "@thecointech/utilities/Encrypt";
import { InstructionPacket, GetSigner } from "@thecointech/utilities/VerifiedAction";
import { UserAction } from "@thecointech/utilities/User";

import { AddSettlementDate, MarkComplete } from "./utils";
import { log } from "@thecointech/logging";


export async function FetchUnsettledRecords(type: string, fxApi: IFxRates) {
  const firestore = GetFirestore()
  const collection = firestore.collection(type);
  const allDocs = await collection.get();
  const fetchAllBills = allDocs.docs.map(async (d) => {
    const path = d.get('ref');
    const billDocument = firestore.doc(path);
    const rawData = await billDocument.get();
    const record = rawData.data() as CertifiedTransferRecord;
    await AddSettlementDate(record, fxApi);
    return record;
  });
  log.debug({action: type}, `Fetched ${fetchAllBills.length} actions of type: {action}`)
  return await Promise.all(fetchAllBills)
}

export function DecryptRecords(records: CertifiedTransferRecord[], privateKey: string) {
  return records.map((record) => {
    const instructions = decryptTo<InstructionPacket>(privateKey, record.instructionPacket);
    return instructions;
  });
}
export async function MarkCertComplete(actionType: UserAction, record: CertifiedTransferRecord) {

  // Check that we got the right everything:
  const user = GetSigner(record);
  if (!user)
    throw new Error("No user present");

  await MarkComplete(user, actionType, record);
  log.debug({action: actionType, hash: record.hash, address: user},
    `Completed Certified {action} action for {address} with hash: {hash}`);
}
