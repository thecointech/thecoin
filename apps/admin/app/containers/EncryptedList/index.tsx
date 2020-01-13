import React, { useState, useCallback, useEffect } from "react";
import { GetFirestore, TransferRecord } from "@the-coin/utilities/Firestore";
import { decryptTo } from "@the-coin/utilities/Encrypt";
import { NextOpenTimestamp } from "@the-coin/utilities/MarketStatus";
import * as FxActions from '@the-coin/shared/containers/FxRate/actions';
import { useDispatch, useSelector } from "react-redux";
import { fromMillis, now } from "utils/Firebase";
import { PrivateKeyButton } from "./PrivateKeyButton";
import { Timestamp } from "@the-coin/utilities/FirebaseFirestore";
import { TransferList } from "./TransferList";
import { InstructionPacket, InstructionRenderer } from "./types";
import { weBuyAt } from "@the-coin/shared/containers/FxRate/reducer";
import { toHuman } from "@the-coin/utilities";
import { GetSigner } from "@the-coin/utilities/VerifiedAction";
import { GetActionDoc, GetActionRef, UserAction } from "@the-coin/utilities/User";
import { selectFxRate } from "@the-coin/shared/containers/FxRate/selectors";
import { FXRate } from "@the-coin/pricing";
import { Confirm } from "semantic-ui-react";

type Props = {
  render: InstructionRenderer,
  type: UserAction,
}

export const EncryptedList = ({render, type}: Props) => {
  const [privateKey, setPrivateKey] = useState("");
  const [records, setRecords] = useState<TransferRecord[]>([]);
  const [instructions, setInstructions] = useState<InstructionPacket[]>([]);

  const [completeIndex, setCompleteIndex] = useState(-1);
  const rates = useSelector(selectFxRate);
  const dispatch = useDispatch();

  const setKeyAndUpdate = useCallback((pk: string) => {
    setPrivateKey(_ => {
      // Decrypt and set decryptedRecords
      return pk;
    })
  }, [setPrivateKey]);

  // Load all transfers from DB on mount
  useEffect(() => {
    const fxActions = FxActions.mapDispatchToProps(dispatch);
    FetchUnsettledRecords(type, fxActions)
      .then(setRecords)
      .then(() => setCompleteIndex(-2))
      .catch(alert)
  }, [])

  // Update Fiat as it becomes available
  useEffect(() => {
    const withFiat = records.map(r => ({
      ...r,
      fiatDisbursed: toFiat(r, rates.rates)
    }))
    setRecords(withFiat)
  }, [rates, completeIndex])

  // Decrypt all when possible
  useEffect(() => {
    if (!!privateKey)
    {
      const instructions = DecryptRecords(records, privateKey);
      setInstructions(instructions);
    }
  }, [privateKey, records])

  //
  const confirmedComplete = useCallback(async () => {
    if (completeIndex <= 0 || completeIndex >= records.length)
      throw new Error("Invalid index to complete")
    const record = records[completeIndex];
    await MarkComplete(type, record);
    console.log("Record completed: " + completeIndex);
    setRecords(records => delete records[completeIndex] && records);  
  }, [completeIndex, records]);

  /////////////////////////////////////////////
  
  const onCancel = useCallback(() => setCompleteIndex(-1), [setCompleteIndex])
  const toComplete = records[completeIndex];

  return (
    <>
      <PrivateKeyButton hasKey={!!privateKey} setPrivateKey={setKeyAndUpdate} />
      <TransferList
        records={records}
        instructions={instructions}
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

async function FetchUnsettledRecords(type: string, fxActions: FxActions.DispatchProps) {
  const firestore = GetFirestore()
  const collection = firestore.collection(type);
  const allDocs = await collection.get();
  const fetchAllBills = allDocs.docs.map(async (d) => {
    const path = d.get('ref');
    const billDocument = firestore.doc(path);
    const rawData = await billDocument.get();
    const record = rawData.data() as TransferRecord;
    record.processedTimestamp = await GetSettlementDate(record.recievedTimestamp, fxActions);
    return record;
  });
  return await Promise.all(fetchAllBills)
}

async function GetSettlementDate(recieved: Timestamp, fxActions: FxActions.DispatchProps) {
  const recievedAt = recieved.toDate();
  const nextOpen = await NextOpenTimestamp(recievedAt);
  if (nextOpen < Date.now()) {
    fxActions.fetchRateAtDate(new Date(nextOpen));		
  }
  return fromMillis(nextOpen);
}

const toFiat = (record: TransferRecord, rates: FXRate[]) => {
  const processed = record.processedTimestamp;
  const fxDate = !processed || processed.toDate() > new Date() ? undefined : processed.toDate();
  const rate = weBuyAt(rates, fxDate);
  return toHuman(rate * record.transfer.value, true);
}

function DecryptRecords(records: TransferRecord[], privateKey: string) {
  return records.map((record) => {
    const instructions = decryptTo<InstructionPacket>(privateKey, record.instructionPacket);
    return instructions;
  });
}

// Update DB with completion
async function MarkComplete(actionType: UserAction, record: TransferRecord) {

  // Check that we got the right everything:
  const user = GetSigner(record);
  if (!user)
    throw new Error("No user present");
  
  const actionDoc = GetActionDoc(user, actionType, record.hash);
  const action = await actionDoc.get();
  if (!action.exists) 
    throw new Error("Oh No! You lost your AP");

  // Ensure we only complete once filling in the appropriate data
  if (!record.fiatDisbursed || !record.processedTimestamp)
    throw new Error("Missing required data: " + JSON.stringify(record));

  // Mark with the timestamp we finally finish this action
  record.completedTimestamp = now();
  await actionDoc.set(record);

  const ref = GetActionRef(actionType, record.hash);
  const deleteResults = await ref.delete();
  if (deleteResults && !deleteResults.writeTime) {
    throw new Error("I feel like something should happen here")
  }
}