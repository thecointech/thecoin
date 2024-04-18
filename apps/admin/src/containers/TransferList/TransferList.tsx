import { ActionType } from '@thecointech/broker-db';
import { AnyActionContainer } from '@thecointech/tx-statemachine';
import { useState } from "react";
import { List, Icon } from "semantic-ui-react";
import { TransferRow } from "./TransferRow";
import { TransferRenderer } from "./types";


type Props = {
  transfers: AnyActionContainer[];
  render: TransferRenderer<ActionType>,
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
            <List.Header>
              <span style={{minWidth: 200}}>
                {transfer.action.data.date.toSQLDate()} -
                $FIXME {/*transfer.action.fiatDisbursed?.toFixed(2)*/}
              </span>
              <TransferStateIcon isComplete={false} />
            </List.Header>
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


type CompleteStateProps = {
  isComplete?: boolean
}

const TransferStateIcon = ({isComplete}: CompleteStateProps) =>
  isComplete
    ? <Icon name="check circle outline" style={{color: "green"}} />
    : <Icon name="circle outline"  style={{color: "blue"}} />
