import React from "react";
import { TransferRecord } from "@the-coin/utilities/lib/Firestore";
import { weBuyAt } from "@the-coin/components/containers/FxRate/reducer";
import { toHuman } from "@the-coin/utilities";
import { useSelector } from "react-redux";
import { selectFxRate } from "@the-coin/components/containers/FxRate/selectors";
import { Accordion, Icon, Button } from "semantic-ui-react";
import { Timestamp } from "@the-coin/utilities/lib/FirebaseFirestore";
import { InstructionRenderer, InstructionPacket } from "./types";

type Props = { 
  item: TransferRecord,
  setActive: () => void,
  markComplete: () => void,
  render: InstructionRenderer;
  instruction?: InstructionPacket,
  settlementTimestamp?: Timestamp,
  active?: boolean
}
	//
	// Render an individual bill
	export const TransferRow = ({ item, instruction, settlementTimestamp, active, setActive, render, markComplete }: Props) =>	{

    const { recievedTimestamp, transfer } = item;
		if (!instruction) {
			return <div>Not Decoded: Add the private encryption key</div>
    }
    if (!settlementTimestamp) {
      return <div>Settlement Date not computed: please wait</div>
    }
    const settlementDate = settlementTimestamp.toDate();
    if (settlementDate.getTime() > Date.now()) {
			return <div>This instruction can be settled on {settlementDate.toDateString()}</div>
		}
		if (!item.confirmed) {
			return <div>Instruction submitted on {recievedTimestamp.toDate().toDateString()} is not confirmed</div>
		}

		const { rates } = useSelector(selectFxRate);
		const rate = weBuyAt(rates, settlementDate)
		const cad = toHuman(transfer.value * rate, true);
		const recievedAt = recievedTimestamp.toDate();
		const processOn = recievedTimestamp === settlementTimestamp ? null : <div>Process On: {settlementDate.toString()}</div>;
		
		return (
			<Accordion>
				<Accordion.Title active={active} onClick={setActive}>
					<Icon name='dropdown' />
          CAD: ${cad}
				</Accordion.Title>
				<Accordion.Content active={active}>
					<div>THE: {toHuman(transfer.value)}</div>
					<div>Recieved: {recievedAt.toLocaleTimeString()}</div>
					{processOn}
					{render(instruction)}
					<Button onClick={markComplete}>Mark Complete</Button>
				</Accordion.Content>
			</Accordion>
			)
	}
