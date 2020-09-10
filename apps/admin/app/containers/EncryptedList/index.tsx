import React, { useState, useCallback, useEffect } from "react";
import { CertifiedTransferRecord } from "@the-coin/utilities/firestore";
import { useFxRatesApi, useFxRates } from "@the-coin/shared/containers/FxRate";
import { PrivateKeyButton } from "./PrivateKeyButton";
import { TransferList } from "../TransferList/TransferList";
import { UserAction } from "@the-coin/utilities/User";
import { Confirm } from "semantic-ui-react";
import { withFiat } from "@the-coin/tx-processing/base/utils";
import { TransferRenderer, InstructionPacket,  } from "@the-coin/tx-processing";
import { FetchUnsettledRecords, DecryptRecords, MarkCertComplete } from "@the-coin/tx-processing/base";
import { setActionPrivateKey } from "@the-coin/tx-processing/base/key";

type Props = {
  render: TransferRenderer,
  type: UserAction,
}

export const EncryptedList = ({render, type}: Props) => {
  const [privateKey, setPrivateKey] = useState("");
  const [records, setRecords] = useState<CertifiedTransferRecord[]>([]);
  const [instructions, setInstructions] = useState<InstructionPacket[]>([]);

  const [completeIndex, setCompleteIndex] = useState(-1);
  const {rates} = useFxRates();

  ////////////////////////////////////////////////////////
  const setKeyAndUpdate = useCallback((pk: string) => {
    setPrivateKey(_ => {
      // Decrypt and set decryptedRecords
      return pk;
    })
    setActionPrivateKey(pk);
  }, [setPrivateKey]);

  ////////////////////////////////////////////////////////
  // Load all transfers from DB on mount
  const fxApi = useFxRatesApi();
  useEffect(() => {
    FetchUnsettledRecords(type, fxApi)
      .then(setRecords)
      .then(() => setCompleteIndex(-2))
      .catch(alert)
  }, [])

  ////////////////////////////////////////////////////////
  // Update Fiat as it becomes available
  useEffect(() => {
    const toComplete = withFiat(records, rates);
    setRecords(toComplete);
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
    alert("NOT TESTED: Set breakpoint and then run this");
    setRecords(records => records.splice(completeIndex));
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

