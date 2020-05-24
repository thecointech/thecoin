import { IFxRates } from "../../../../libs/shared/src/containers/FxRate";
import { GetFirestore, CertifiedTransferRecord } from "../../../../libs/utils-ts/src/Firestore";
import { AddSettlementDate, MarkComplete } from "autoaction/utils";
import { decryptTo } from "../../../../libs/utils-ts/src/Encrypt";
import { InstructionPacket, GetSigner } from "../../../../libs/utils-ts/src/VerifiedAction";
import { UserAction } from "../../../../libs/utils-ts/src/User";



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
}
