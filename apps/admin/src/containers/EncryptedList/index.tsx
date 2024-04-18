import { useState, useCallback, useEffect } from "react";
import { PrivateKeyButton } from "./PrivateKeyButton";
import { TransferList, TransferRenderer } from "../TransferList";
import { Confirm } from "semantic-ui-react";
import { ActionType, getAllActions, getAllUsers } from '@thecointech/broker-db';
import { TypedActionContainer } from '@thecointech/tx-statemachine';

type Props<Type extends ActionType> = {
  render: TransferRenderer<Type>,
  type: Type,
}

export const EncryptedList = <Type extends ActionType>({render, type}: Props<Type>) => {
  const [privateKey, setPrivateKey] = useState("");
  const [records, /*_setRecords*/] = useState<TypedActionContainer<Type>[]>([]);
  const [completeIndex, setCompleteIndex] = useState(-1);

  ////////////////////////////////////////////////////////
  const setKeyAndUpdate = (pk: string) => {
    setPrivateKey(_ => {
      // Decrypt and set decryptedRecords
      return pk;
    })
  };

  ////////////////////////////////////////////////////////
  // Load all transfers from DB on mount
  useEffect(() => {
    getAllUsers()
      .then(getAllActions)
      // .then(a => setRecords(a[type]))
      .then(() => setCompleteIndex(-2))
      .catch(alert)
  }, [])

  ////////////////////////////////////////////////////////
  // Decrypt all when possible
  useEffect(() => {
    if (!!privateKey)
    {
      // const instructions = DecryptRecords(records, privateKey);
      // setInstructions(instructions);
    }
  }, [privateKey, records])

  ////////////////////////////////////////////////////////
  const confirmedComplete = useCallback(async () => {
    // if (completeIndex < 0 || completeIndex >= records.length)
    //   throw new Error("Invalid index to complete")
    // const record = records[completeIndex];
    // await MarkCertComplete(type, record);
    // console.log("Record completed: " + completeIndex);
    // alert("NOT TESTED: Set breakpoint and then run this");
    // setRecords(records => records.splice(completeIndex));
    // setCompleteIndex(-1);
  }, [completeIndex, records]);

  ////////////////////////////////////////////////////////
  const onCancel = useCallback(() => setCompleteIndex(-1), [setCompleteIndex])
  const toComplete = records[completeIndex];

  return (
    <>
      <PrivateKeyButton hasKey={!!privateKey} setPrivateKey={setKeyAndUpdate} />
      <TransferList
        transfers={records}
        markComplete={setCompleteIndex}
        render={render as any}
        />
      <Confirm
        content={`Confirm ${type}: $${toComplete?.action.data.initialId} from ${toComplete?.action.data.date.toSQLDate()}`}
        open={completeIndex >= 0}
        onCancel={onCancel}
        onConfirm={confirmedComplete} />
    </>
  )
}
