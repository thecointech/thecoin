import React from "react";
import { Segment } from "semantic-ui-react";
import { BuyActionContainer, getCurrentState } from '@thecointech/tx-processing/statemachine';

export const DepositRenderer = (props : BuyActionContainer) => {

  const { action, instructions } = props;
  const state = getCurrentState(props);
  return (
    <Segment>
    <div>Name: {instructions?.name} - {action.type}</div>
    <div>Address: {instructions?.address}</div>
    <div>
    {
      instructions?.raw
        ? `Email Recieved on: ${instructions?.recieved?.toSQLDate()}`
        : "Warning: No matching email"
    }
    </div>
    <div>State: ${state.name} - {state.delta.date.toSQLDate()}</div>
    {/* <div>
    {
      deposit.bank
        ? `Deposited on: ${deposit.bank.Date.toFormat("DD")}`
        : "Warning: Could not find deposit"
    }
    </div>
    <div>
    {
      deposit.tx
        ? `Tx Hash: ${deposit.tx.txHash}`
        : "Warning: No hash present"
    }
    </div> */}
  </Segment>
  )
}
