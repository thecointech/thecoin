import React, { useCallback } from "react";
import { TransferData } from "containers/TransferList/types";
import { DepositInstructions } from "./types";
import { Segment, Button } from "semantic-ui-react";


export const DepositRenderer = (props: TransferData) => {
  const deposit = props.instruction as DepositInstructions;

  const onDeposit = useCallback(() => { 
    alert("Now we make the deposit");
  }, [deposit]);
  return (
    <Segment>
    <div>Name: {deposit.name}</div>
    <div>Email: {deposit.email}</div>

    <Button onClick={onDeposit}>Deposit</Button>
  </Segment>
  )
}