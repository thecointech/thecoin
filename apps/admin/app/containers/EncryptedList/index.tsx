import React, { useState, useCallback, useEffect } from "react";
import { GetFirestore, TransferRecord } from "@the-coin/utilities/lib/Firestore";
import { decryptTo } from "@the-coin/utilities/lib/Encrypt";
import { NextOpenTimestamp } from "@the-coin/utilities/lib/MarketStatus";
import * as FxActions from '@the-coin/shared/containers/FxRate/actions';
import { useDispatch } from "react-redux";
import { fromMillis } from "utils/Firebase";
import { PrivateKeyButton } from "./PrivateKeyButton";
import { Timestamp } from "@the-coin/utilities/lib/FirebaseFirestore";
import { TransferList } from "./TransferList";
import { InstructionPacket, InstructionRenderer } from "./types";

type Props = {
  render: InstructionRenderer,
  type: string
}

export const EncryptedList = ({render, type}: Props) => {
  const [privateKey, setPrivateKey] = useState("");
  const [records, setRecords] = useState<TransferRecord[]>([]);
  const [instructions, setInstructions] = useState<InstructionPacket[]>([]);
  const [settlements, setSettlements] = useState<Timestamp[]>([]);
  const dispatch = useDispatch();

  const setKeyAndUpdate = useCallback((pk: string) => {
    setPrivateKey(_ => {
      // Decrypt and set decryptedRecords
      return pk;
    })
  }, [setPrivateKey]);

  // Load all transfers from DB on mount
  useEffect(() => {
    FetchUnsettledRecords(type)
      .then(setRecords)
      .catch(alert)
  }, [])

  useEffect(() => {
    const fxActions = FxActions.mapDispatchToProps(dispatch);
    GetSettlementDates(records, fxActions)
      .then(setSettlements)
      .catch(alert)
  }, [records])

  // Decrypt all when possible
  useEffect(() => {
    if (!!privateKey)
    {
      const instructions = DecryptRecords(records, privateKey);
      setInstructions(instructions);
    }
  }, [privateKey, records])

  const onMarkComplete = useCallback(async (index: number) => {
		const record = records[index];
    await MarkComplete(record, settlements[index]);
    setRecords(records => delete records[index] && records);
  }, [records, settlements]);

  return (
    <>
      <PrivateKeyButton hasKey={!!privateKey} setPrivateKey={setKeyAndUpdate} />
      <TransferList
        records={records}
        instructions={instructions}
        settlements={settlements}
        markComplete={onMarkComplete}
        render={render}
        />
    </>
  )
}

async function FetchUnsettledRecords(type: string) {
  const firestore = GetFirestore()
  const collection = firestore.collection(type);
  const allDocs = await collection.get();
  const fetchAllBills = allDocs.docs.map(async (d) => {
    const path = d.get('ref');
    const billDocument = firestore.doc(path);
    const rawData = await billDocument.get();
    return rawData.data() as TransferRecord;
  });
  return await Promise.all(fetchAllBills)
}

async function GetSettlementDates(records: TransferRecord[], fxActions: FxActions.DispatchProps)
{
  const settlements = records.map(async rec => {
    const recievedAt = rec.recievedTimestamp.toDate();
    const nextOpen = await NextOpenTimestamp(recievedAt);
    if (nextOpen < Date.now()) {
      fxActions.fetchRateAtDate(new Date(nextOpen));		
    }
    return fromMillis(nextOpen);
  })
  return Promise.all(settlements);
}

function DecryptRecords(records: TransferRecord[], privateKey: string) {
  return records.map((record) => {
    const instructions = decryptTo<InstructionPacket>(privateKey, record.instructionPacket);
    return instructions;
  });
}

// class BillPaymentsClass extends React.PureComponent<Props, State> {

// 	state = initialState;

// 	onBillAccordionClicked = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, data: AccordionTitleProps) => this.setState({activeIndex: data.index as number})


// 	onBeginMarkComplete = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
// 		event.preventDefault()
// 		this.setState({doConfirm: true})
// 	}

// 	onCancel = () => this.setState({doConfirm: false})
// 	onMarkComplete = async () => {
// 		const { activeIndex } = this.state;
// 		const bill = this.state.unsettledBills[activeIndex];
// 		await this.markBillComplete(bill);
// 		this.setState((state) => {
// 			delete state.unsettledBills[activeIndex];
// 			delete state.decryptedPayees[activeIndex];
// 			return {
// 				unsettledBills: [].concat(state.unsettledBills),
// 				decryptedPayees: [].concat(state.decryptedPayees),
// 				doConfirm: false
// 			}
// 		})
// 	}

// 	componentWillMount() {
// 		this.fetchBillsToSettle();
// 	}

// 	async processTimestamp(ts: Timestamp)
// 	{
// 		const recievedAt = ts.toDate();
// 		const nextOpen = await NextOpenTimestamp(recievedAt, );
// 		if (nextOpen < Date.now()) {
// 			this.props.fetchRateAtDate(new Date(nextOpen));		
// 		}
// 		return fromMillis(nextOpen);
// 	}

// 	async processRawBill(bill: any, index: number)
// 	{
// 		const rawData = bill as BillPaymentRecord;
// 		let {processedTimestamp, recievedTimestamp, encryptedPayee } = rawData;
// 		// ** Temp testing hack, deal with renamed items **
// 		if (!recievedTimestamp) {
// 			recievedTimestamp = processedTimestamp;
// 		}
// 		if (!processedTimestamp) {
// 			processedTimestamp = await this.processTimestamp(recievedTimestamp);
// 		}
// 		const decryptedPayee = decryptTo<BrokerCAD.BillPayeePacket>(this.state.privateKey, encryptedPayee);
// 		this.setState((state, props) => {
// 			let newDecrypted = [].concat(state.decryptedPayees);
// 			newDecrypted[index] = decryptedPayee;
// 			return {
// 				decryptedPayees: newDecrypted
// 			}
// 		})
// 		return {
// 			...bill,
// 			recievedTimestamp,
// 			processedTimestamp,
// 		} as BillPaymentRecord
// 	}

// 	async processAllRawBills() {
// 		const { unsettledBills, privateKey } = this.state;
// 		if (!privateKey)
// 			return;

// 		const billsPromised = unsettledBills.map((bill, index) => this.processRawBill(bill, index));
// 		const processedBills = await Promise.all(billsPromised);
// 		this.setState({unsettledBills: processedBills});
// 	}

// 	//
// 	// Fetch all raw data from Firestore
// 	async fetchBillsToSettle() {
// 		const firestore = await GetFirestore()
// 		const billCollection = firestore.collection("Bill");
// 		const allDocs = await billCollection.get();
// 		const fetchAllBills = allDocs.docs.map(async (d) => {
// 			const path = d.get('ref');
// 			const billDocument = firestore.doc(path);
// 			const rawData = await billDocument.get();
// 			return rawData.data() as BillPaymentRecord
// 		});
// 		const allBills = await Promise.all(fetchAllBills)
// 		this.setState({unsettledBills: allBills });
// 		// Delay processing to allow setState to complete
// 		setTimeout(() => this.processAllRawBills(), 100);
// 	}

// 	// Update DB with completion
// 	async markBillComplete(bill: BillPaymentRecord) {
// 		const { processedTimestamp } = bill;
// 		const rate = weBuyAt(this.props.rates, processedTimestamp.toDate())
// 		const cad = toHuman(bill.transfer.value * rate, true);

// 		// Check that we got the right everything:
// 		const user = GetBillPaymentSigner(bill);
// 		const actionDoc = GetActionDoc(user, "Bill", bill.hash);
// 		const action = await actionDoc.get();
// 		if (!action.exists) 
// 			throw new Error("Oh No! You lost your AP");

// 		bill.fiatDisbursed = cad;
// 		await actionDoc.set(bill);

// 		const ref = GetActionRef(ACTION_TYPE, bill.hash);
// 		const deleteResults = await ref.delete();
// 		if (deleteResults && !deleteResults.writeTime) {
// 			throw new Error("I feel like something should happen here")
// 		}
// 	}

// 	//
// 	// Render an individual bill
// 	renderBill(bill: BillPaymentRecord, index: number)
// 	{
// 		const { recievedTimestamp, processedTimestamp, transfer } = bill;
// 		const decryptedPayee = this.state.decryptedPayees[index];
// 		if (!decryptedPayee || !recievedTimestamp || !processedTimestamp) {
// 			return <div>Not Decoded: Add the private encryption key</div>
// 		}
// 		const processedDate = processedTimestamp.toDate();
// 		if (processedTimestamp.toMillis() > Date.now()) {
// 			return <div>This bill can be settled on {processedDate.toDateString()}</div>
// 		}
// 		if (!bill.confirmed) {
// 			return <div>Bill submitted on {recievedTimestamp.toDate().toDateString()} is not confirmed</div>
// 		}

// 		const { rates } = this.props;
// 		const { activeIndex } = this.state
// 		const processDate = processedTimestamp.toDate();
// 		const rate = weBuyAt(rates, processDate)
// 		const cad = toHuman(bill.transfer.value * rate, true);
// 		const recievedAt = recievedTimestamp.toDate();
// 		const active = activeIndex === index
// 		const processOn = recievedTimestamp === processedTimestamp ? null : <div>Process On: {processDate.toString()}</div>;
		
// 		return (
// 			<Accordion>
// 				<Accordion.Title active={active} index={index} onClick={this.onBillAccordionClicked}>
// 					<Icon name='dropdown' />
// 					{decryptedPayee.payee} - THE: {toHuman(transfer.value)}
// 				</Accordion.Title>
// 				<Accordion.Content active={active}>
// 					<div>CAD: ${cad}</div>
// 					<div>Recieved: {recievedAt.toLocaleTimeString()}</div>
// 					{processOn}
// 					<div>Acc #: {decryptedPayee.accountNumber}</div>
// 					<Button onClick={this.onBeginMarkComplete}>Mark Complete</Button>
// 				</Accordion.Content>
// 			</Accordion>
// 			)
// 	}

// 	//
// 	// Render all incomplete bill payments
// 	renderBillPayments()
// 	{
// 		const { unsettledBills } = this.state;
// 		const bills = unsettledBills.map((bill, index) => {
// 			// Remove once DB updated
// 			var recDate = bill.recievedTimestamp ? bill.recievedTimestamp.toDate() : bill.processedTimestamp.toDate();
// 			return (
// 				<List.Item key={bill.hash}>
// 					<List.Content>
// 						<List.Header>{recDate.toDateString()} - {bill.transfer.value}</List.Header>
// 						{ this.renderBill(bill, index) }
// 					</List.Content>
// 				</List.Item>
// 			)
// 		});
// 		return <List divided relaxed>{bills}</List>
// 	}

// 	render()
// 	{
// 		const allBills = this.renderBillPayments();
// 		const {privateKey} = this.state;
// 		return (
// 			<React.Fragment>
// 				<Button as="label" htmlFor="file" type="button" disabled={!!privateKey}>
// 					Select Private Key
// 				</Button>
// 				<input type="file" id="file" accept=".pem" hidden onChange={this.onPkSelected} />
// 				{allBills}
// 				<Confirm open={this.state.doConfirm} onCancel={this.onCancel} onConfirm={this.onMarkComplete} />
// 			</React.Fragment>
// 		)
// 	}
// }

// export const BillPayments = connect(FxSelect.selectFxRate, FxActions.mapDispatchToProps)(BillPaymentsClass);

