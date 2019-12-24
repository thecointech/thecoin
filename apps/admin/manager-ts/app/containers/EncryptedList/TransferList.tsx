import React, { useState } from "react";
import { List } from "semantic-ui-react";
import { TransferRecord } from "@the-coin/utilities/lib/Firestore";
import { TransferRow } from "./TransferRow";
import { Timestamp } from "@the-coin/utilities/lib/FirebaseFirestore";
import { InstructionPacket, InstructionRenderer } from "./types";

type Props = {
  records: TransferRecord[];
  instructions: InstructionPacket[];
  settlements: Timestamp[];
  render: InstructionRenderer,
  markComplete: (index: number) => void,
}

export const TransferList = ({records, instructions, settlements, render, markComplete}: Props) => {

  const [active, setActive] = useState(-1);
  return (
    <List divided relaxed>
    {
      records.map((record, index) => (
        <List.Item key={index}>
          <List.Content>
            <List.Header>{record.recievedTimestamp.toDate().toDateString()} - {record.transfer.value}</List.Header>
            <TransferRow 
              item={record}
              instruction={instructions[index]}
              settlementTimestamp={settlements[index]}
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
