import React from "react";
import { toHuman } from "@thecointech/utilities";
import { Accordion, Icon, Button } from "semantic-ui-react";
import { TransferRenderer, TransactionData } from "./types";

type Props = {
  transfer: TransactionData,
  setActive: () => void,
  markComplete: () => void,
  render: TransferRenderer;
  active?: boolean
}
//
// Render an individual bill
export const TransferRow = ({ transfer, active, setActive, render, markComplete }: Props) => {

  const { record, instruction } = transfer;
  const { processedTimestamp, recievedTimestamp } = record;
  if (!instruction) {
    return <div>Not Decoded: Add the private encryption key</div>
  }
  if (!processedTimestamp) {
    return <div>Settlement Date not computed: please wait...</div>
  }
  // A confirmed action has the initial tx finished, but for sales we need to
  // to show deposits even before they are
  if (!record.confirmed && !record.fiatDisbursed) {
    return <div>Instruction submitted on {recievedTimestamp.toDate().toDateString()} is not confirmed</div>
  }

  // const now = new Date();
  const settlementDate = processedTimestamp.toDate();
  // const { rates } = useSelector(selectFxRate);
  // const rate = weBuyAt(rates, new Date(Math.min(settlementDate.getTime(), now.getTime()));
  // const cad = toHuman(transfer.value * rate, true);
  const recievedAt = recievedTimestamp.toDate();
  const processOn = recievedTimestamp === processedTimestamp ? null : <div>Process On: {settlementDate.toString()}</div>;
  const completion = (settlementDate.getTime() > Date.now())
    ? <div>This instruction can be settled on {settlementDate.toDateString()}</div>
    : <Button onClick={markComplete}>Mark Complete</Button>
    // (!completedTimestamp)
    //   ? <Button onClick={markComplete}>Mark Complete</Button>
    //   : <div>Completed</div>

  return (
    <Accordion>
      <Accordion.Title active={active} onClick={setActive}>
        <Icon name='dropdown' />
            THE: {toHuman(record.transfer.value)}
      </Accordion.Title>
      <Accordion.Content active={active}>
        <div>Recieved: {recievedAt.toLocaleTimeString()}</div>
        {processOn}
        {render(transfer)}
        {completion}
      </Accordion.Content>
    </Accordion>
  )
}
