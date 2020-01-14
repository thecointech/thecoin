import React from "react";
import { TransferRecord } from "@the-coin/utilities/Firestore";
import { toHuman } from "@the-coin/utilities";
import { Accordion, Icon, Button } from "semantic-ui-react";
import { Timestamp } from "@the-coin/types/FirebaseFirestore";
import { InstructionRenderer, InstructionPacket } from "./types";

type Props = {
  item: TransferRecord,
  setActive: () => void,
  markComplete: () => void,
  render: InstructionRenderer;
  instruction?: InstructionPacket,
  processedTimestamp?: Timestamp,
  active?: boolean
}
	//
	// Render an individual bill
	export const TransferRow = ({ item, instruction, processedTimestamp, active, setActive, render, markComplete }: Props) =>	{

    const { recievedTimestamp, transfer } = item;
		if (!instruction) {
			return <div>Not Decoded: Add the private encryption key</div>
    }
    if (!processedTimestamp) {
      return <div>Settlement Date not computed: please wait...</div>
    }
		if (!item.confirmed) {
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

		return (
      <>

        <Accordion>
          <Accordion.Title active={active} onClick={setActive}>
            <Icon name='dropdown' />
            THE: {toHuman(transfer.value)}
          </Accordion.Title>
          <Accordion.Content active={active}>
            <div>Recieved: {recievedAt.toLocaleTimeString()}</div>
            {processOn}
            {render(instruction)}
            {completion}
          </Accordion.Content>
        </Accordion>
        </>
			)
	}
