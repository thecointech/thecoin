import React, { useState } from "react";
import { List } from "semantic-ui-react";
import { TransferRow } from "./TransferRow";
import { TransferData, TransferRenderer } from "./types";

type Props = {
  transfers: TransferData[];
  render: TransferRenderer,
  markComplete: (index: number) => void,
}

export const TransferList = ({transfers, render, markComplete}: Props) => {
  const [active, setActive] = useState(-1);
  return (
    <List divided relaxed>
    {
      transfers.map((transfer, index) => (
        <List.Item key={index}>
          <List.Content>
            <List.Header>{transfer.record.recievedTimestamp.toDate().toDateString()} - ${transfer.record.fiatDisbursed?.toFixed(2)}</List.Header>
            <TransferRow 
              transfer={transfer}
              active={active === index} 
              setActive={() => setActive(index)} 
              markComplete={() => markComplete(index)}
              render={render} />

          </List.Content>
        </List.Item>
      ))
    }
    </List>
  )
}
