import React, { useState } from "react";
import { List } from "semantic-ui-react";
import { TransferRecord } from "@the-coin/utilities/lib/Firestore";
import { TransferRow } from "./TransferRow";
import { Timestamp } from "@the-coin/utilities/lib/FirebaseFirestore";
import { InstructionPacket, InstructionRenderer } from "./types";
import { selectFxRate } from "@the-coin/components/containers/FxRate/selectors";
import { useSelector } from "react-redux";
import { weBuyAt } from "@the-coin/components/containers/FxRate/reducer";
import { FXRate } from "@the-coin/pricing";
import { toHuman } from "@the-coin/utilities";

type Props = {
  records: TransferRecord[];
  instructions: InstructionPacket[];
  settlements: Timestamp[];
  render: InstructionRenderer,
  markComplete: (index: number) => void,
}

const toCAD = (record: TransferRecord, rates: FXRate[], settles?: Timestamp) => {

  const fxDate = !settles || settles.toDate() > new Date() ? undefined : settles.toDate();
  const rate = weBuyAt(rates, fxDate);
  const cad = toHuman(rate * record.transfer.value);
  return cad.toFixed(2);
}

export const TransferList = ({records, instructions, settlements, render, markComplete}: Props) => {
  const { rates } = useSelector(selectFxRate);
  const [active, setActive] = useState(-1);
  return (
    <List divided relaxed>
    {
      records.map((record, index) => (
        <List.Item key={index}>
          <List.Content>
            <List.Header>{record.recievedTimestamp.toDate().toDateString()} - ${toCAD(record, rates, settlements[index])}</List.Header>
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
