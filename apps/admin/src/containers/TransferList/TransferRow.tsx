import { Accordion, Icon } from "semantic-ui-react";
import { TransferRenderer } from "./types";
import { AnyActionContainer } from '@thecointech/tx-statemachine';
import { ActionType } from '@thecointech/broker-db';

type Props = {
  transfer: AnyActionContainer,
  setActive: () => void,
  markComplete: () => void,
  render: TransferRenderer<ActionType>;
  active?: boolean
}
//
// Render an individual bill
export const TransferRow = ({ transfer, active, setActive, render }: Props) => {

  const { action, instructions } = transfer;
  if (!instructions) {
    return <div>Not Decoded: Add the private encryption key</div>
  }
  // if (!history) {
  //   return <div>Settlement Date not computed: please wait...</div>
  // }
  // A confirmed action has the initial tx finished, but for sales we need to
  // to show deposits even before the coin transaction is completed
  const recieved = action.data.date;
  const firstHash = action.history.find(h => h.hash)
  if (!firstHash) {
    return <div>Instruction submitted on {recieved.toSQLDate()} is not confirmed</div>
  }

  const settlement = action.history.find(h => h.type == 'toCoin');
  const date = settlement?.date ?? settlement?.created;
  const processOn = date ? <div>Process On: {date.toSQLDate()}</div> : null;

  return (
    <Accordion>
      <Accordion.Title active={active} onClick={setActive}>
        <Icon name='dropdown' />
            THE: TODO
      </Accordion.Title>
      <Accordion.Content active={active}>
        <div>Recieved: {recieved.toLocaleString()}</div>
        {processOn}
        {render(transfer)}
      </Accordion.Content>
    </Accordion>
  )
}
