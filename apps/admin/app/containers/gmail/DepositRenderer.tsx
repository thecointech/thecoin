import React, { useCallback } from "react";
import { TransferData } from "containers/TransferList/types";
import { DepositInstructions, DepositData, OldPurchseDB } from "./types";
import { Segment, Button, Select } from "semantic-ui-react";


export const DepositRenderer = (props: TransferData) => {
  const deposit = props.instruction as DepositInstructions;
  const db = (props as DepositData).db;

  const onDeposit = useCallback(() => { 
    alert("Now we make the deposit");
  }, [deposit]);
  return (
    <Segment>
    <div>Name: {deposit.name}</div>
    <div>Email: {deposit.email}</div>
    <TxSelect db={db} />
    <Button onClick={onDeposit}>Deposit</Button>
  </Segment>
  )
}

type TxSelectProps = {
  db: OldPurchseDB|OldPurchseDB[];
}
const TxSelect = ({db}: TxSelectProps) => {
  if (Array.isArray(db))
    return <Select placeholder="Select a TX" options={db.map(dep => ({key: dep.txHash}))} />
  else {
    return <div>Matched to: {db.txHash}</div>
  }
}
