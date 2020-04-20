import React, { useState, useCallback, useEffect } from "react";
import { GetFirestore, CertifiedTransferRecord, decryptTo, GetSigner, UserAction } from "@the-coin/utilities";
import { FxRate } from "@the-coin/shared";
import { PrivateKeyButton } from "./PrivateKeyButton";
import { TransferList } from "../TransferList/TransferList";

import { Confirm } from "semantic-ui-react";
import { AddSettlementDate, MarkComplete, toFiat } from "../TransferList/utils";
import { TransferRenderer, InstructionPacket } from "containers/TransferList/types";


type Props = {
  render: TransferRenderer,
  type: UserAction,
}

export const EncryptedList = ({render, type}: Props) => {
  const [privateKey, setPrivateKey] = useState("");
  const [records, setRecords] = useState<CertifiedTransferRecord[]>([]);
  const [instructions, setInstructions] = useState<InstructionPacket[]>([]);

  const [completeIndex, setCompleteIndex] = useState(-1);
  const {rates} = FxRate.useFxRates();

  ////////////////////////////////////////////////////////
  const setKeyAndUpdate = useCallback((pk: string) => {
    setPrivateKey(_ => {
      // Decrypt and set decryptedRecords
      return pk;
    })
  }, [setPrivateKey]);

  ////////////////////////////////////////////////////////
  // Load all transfers from DB on mount
  const fxApi = FxRate.useFxRatesApi();
  useEffect(() => {
    FetchUnsettledRecords(type, fxApi)
      .then(setRecords)
      .then(() => setCompleteIndex(-2))
      .catch(alert)
  }, [])

  ////////////////////////////////////////////////////////
  // Update Fiat as it becomes available
  useEffect(() => {
    const withFiat = records.map(r => ({
      ...r,
      fiatDisbursed: toFiat(r, rates)
    }))
    setRecords(withFiat)
  }, [rates, completeIndex])

  ////////////////////////////////////////////////////////
  // Decrypt all when possible
  useEffect(() => {
    if (!!privateKey)
    {
      const instructions = DecryptRecords(records, privateKey);
      setInstructions(instructions);
    }
  }, [privateKey, records])

  ////////////////////////////////////////////////////////
  const confirmedComplete = useCallback(async () => {
    if (completeIndex < 0 || completeIndex >= records.length)
      throw new Error("Invalid index to complete")
    const record = records[completeIndex];
    await MarkCertComplete(type, record);
    console.log("Record completed: " + completeIndex);
    setRecords(records => delete records[completeIndex] && records);
    setCompleteIndex(-1);
  }, [completeIndex, records]);

  ////////////////////////////////////////////////////////
  const onCancel = useCallback(() => setCompleteIndex(-1), [setCompleteIndex])
  const toComplete = records[completeIndex];

  const transfers = records.map((r, i) => ({
    record: r,
    instruction: instructions[i]
  }));

  return (
    <>
      <PrivateKeyButton hasKey={!!privateKey} setPrivateKey={setKeyAndUpdate} />
      <TransferList
        transfers={transfers}
        markComplete={setCompleteIndex}
        render={render}
        />
      <Confirm
        content={`Confirm ${type}: $${toComplete?.fiatDisbursed} from ${toComplete?.recievedTimestamp.toDate().toDateString()}`}
        open={completeIndex >= 0}
        onCancel={onCancel}
        onConfirm={confirmedComplete} />
    </>
  )
}

async function FetchUnsettledRecords(type: string, fxApi: FxRate.IFxRates) {
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



function DecryptRecords(records: CertifiedTransferRecord[], privateKey: string) {
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
