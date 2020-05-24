import { IFxRates } from "@the-coin/shared/containers/FxRate";
import { GetFirestore, CertifiedTransferRecord } from "@the-coin/utilities/Firestore";
import { decryptTo } from "@the-coin/utilities/Encrypt";
import { InstructionPacket, GetSigner } from "@the-coin/utilities/VerifiedAction";
import { UserAction } from "@the-coin/utilities/User";

import { AddSettlementDate, MarkComplete } from "autoaction/utils";
import { log } from "logging";


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
