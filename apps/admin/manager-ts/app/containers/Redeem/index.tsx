import React from "react";
import { GetFirestore, ProcessRecord } from "@the-coin/utilities/lib/Firestore";
import { AccountState } from "../Account/types";
import { Timestamp } from "@google-cloud/firestore";
import { BrokerCAD } from "@the-coin/types";
import { List, Accordion, Icon, Button, AccordionTitleProps, Confirm } from "semantic-ui-react";
import { toHuman } from "@the-coin/utilities";
import { NextOpenTimestamp } from "@the-coin/utilities/lib/MarketStatus";
import * as FxActions from '@the-coin/components/containers/FxRate/actions';
import * as FxSelect from '@the-coin/components/containers/FxRate/selectors';
import { weBuyAt } from "@the-coin/components/containers/FxRate/reducer";
import { connect } from "react-redux";
import { GetActionDoc } from "@the-coin/utilities/lib/User";
import { GetSaleSigner } from '@the-coin/utilities/lib/VerifiedSale';

const BILL_PAYMENT_TYPE = "Sale"

type MyProps = {
  dispatch: FxActions.DispatchProps,
	account: AccountState
}
type Props = MyProps & FxActions.DispatchProps & FxSelect.ContainerState;

// TODO: Dedup this with definitions in service
type VerifiedSaleRecord = BrokerCAD.CertifiedSale & ProcessRecord;

const initialState = {
	unsettledSales: [] as VerifiedSaleRecord[],
	activeIndex: -1,
	doConfirm: false
}
type State = typeof initialState;

class RedeemClass extends React.PureComponent<Props, State> {

	state = initialState;

	componentWillMount() {
		this.fetchSalesToSettle();
	}

	onSaleAccordionClicked = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, data: AccordionTitleProps) => this.setState({activeIndex: data.index as number})
	onBeginMarkComplete = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault()
		this.setState({doConfirm: true})
	}

	onCancel = () => this.setState({doConfirm: false})
	onMarkComplete = async () => {
		const { activeIndex } = this.state;
		const sale = this.state.unsettledSales[activeIndex];
		await this.markSaleComplete(sale);
		this.setState((state) => {
			delete state.unsettledSales[activeIndex];
			return {
				unsettledSales: [].concat(state.unsettledSales),
				doConfirm: false
			}
		})
	}



	async processTimestamp(ts: Timestamp)
	{
		const recievedAt = ts.toDate();
		const nextOpen = await NextOpenTimestamp(recievedAt, );
		if (nextOpen < Date.now()) {
			this.props.fetchRateAtDate(new Date(nextOpen));		
		}
		return Timestamp.fromMillis(nextOpen);
	}

	async processRawSale(sale: any, index: number)
	{
		const rawData = sale as VerifiedSaleRecord;
		let {processedTimestamp, recievedTimestamp } = rawData;
		// ** Temp testing hack, deal with renamed items **
		if (!recievedTimestamp) {
			recievedTimestamp = processedTimestamp;
		}
		if (!processedTimestamp) {
			processedTimestamp = await this.processTimestamp(recievedTimestamp);
		}
		return {
			...sale,
			recievedTimestamp,
			processedTimestamp,
		} as VerifiedSaleRecord
	}

	async processAllRawSales() {
		const { unsettledSales } = this.state;

		const salesPromised = unsettledSales.map((sale, index) => this.processRawSale(sale, index));
		const processedSales = await Promise.all(salesPromised);
		this.setState({unsettledSales: processedSales});
	}

	//
	// Fetch all raw data from Firestore
	async fetchSalesToSettle() {
		const firestore = await GetFirestore()
		const allCollections = await firestore.listCollections();
		allCollections.forEach(c => console.log(c.path));
		const allDocs = await firestore.collection("Sell").get();
		const fetchAllSales = allDocs.docs.map(async (d) => {
			const path = d.get('ref');
			const saleDoc = firestore.doc(path);
			const rawData = await saleDoc.get();
			return rawData.data() as VerifiedSaleRecord
		});
		const allSales = await Promise.all(fetchAllSales)
		this.setState({unsettledSales: allSales });
		// Delay processing to allow setState to complete
		setTimeout(() => this.processAllRawSales(), 100);
	}

	// Update DB with completion
	async markSaleComplete(sale: VerifiedSaleRecord) {
		const { processedTimestamp } = sale;
		const rate = weBuyAt(this.props.rates, processedTimestamp.toDate())
		const cad = toHuman(sale.transfer.value * rate, true);

		// Check that we got the right everything:
		const user = GetSaleSigner(sale);
		const actionDoc = await GetActionDoc(user, "Sale", sale.hash);
		const action = await actionDoc.get();
		if (!action.exists) 
			throw new Error("Oh No! You lost your AP");

		sale.fiatDisbursed = cad;
		await actionDoc.set(sale);

		const firestore = await GetFirestore();
		const ref = firestore.doc(`${BILL_PAYMENT_TYPE}/${sale.hash}`);
		const deleteResults = await ref.delete();
		if (!deleteResults.writeTime) {
			throw new Error("I feel like something should happen here")
		}
	}

	//
	// Render an individual sale
	renderSale(sale: VerifiedSaleRecord, index: number)
	{
		const { recievedTimestamp, processedTimestamp, transfer, clientEmail } = sale;
		const processedDate = processedTimestamp.toDate();
		if (processedTimestamp.toMillis() > Date.now()) {
			return <div>This sale can be settled on {processedDate.toDateString()}</div>
		}
		if (!sale.confirmed) {
			return <div>sale submitted on {recievedTimestamp.toDate().toDateString()} is not confirmed</div>
		}

		const { rates } = this.props;
		const { activeIndex } = this.state
		const processDate = processedTimestamp.toDate();
		const rate = weBuyAt(rates, processDate)
		const cad = toHuman(sale.transfer.value * rate, true);
		const recievedAt = recievedTimestamp.toDate();
		const active = activeIndex === index
		const processOn = recievedTimestamp === processedTimestamp ? null : <div>Process On: {processDate.toString()}</div>;
		
		return (
			<Accordion>
				<Accordion.Title active={active} index={index} onClick={this.onSaleAccordionClicked}>
					<Icon name='dropdown' />
					{clientEmail} - THE: {toHuman(transfer.value)}
				</Accordion.Title>
				<Accordion.Content active={active}>
					<div>CAD: ${cad}</div>
					<div>Recieved: {recievedAt.toLocaleTimeString()}</div>
					{processOn}
					<div>Payee: {clientEmail}</div>
					<Button onClick={this.onBeginMarkComplete}>Mark Complete</Button>
				</Accordion.Content>
			</Accordion>
			)
	}

	//
	// Render all incomplete sale payments
	renderSalePayments()
	{
		const { unsettledSales } = this.state;
		const sales = unsettledSales.map((sale, index) => {
			// Remove once DB updated
			var recDate = sale.recievedTimestamp ? sale.recievedTimestamp.toDate() : sale.processedTimestamp.toDate();
			return (
				<List.Item key={sale.hash}>
					<List.Content>
						<List.Header>{recDate.toDateString()} - {sale.clientEmail}</List.Header>
						{ this.renderSale(sale, index) }
					</List.Content>
				</List.Item>
			)
		});
		return <List divided relaxed>{sales}</List>
	}

	render()
	{
		const allSales = this.renderSalePayments();
		return (
			<React.Fragment>
				<h1>Complete Redemption</h1>
				{allSales}
				<Confirm open={this.state.doConfirm} onCancel={this.onCancel} onConfirm={this.onMarkComplete} />
			</React.Fragment>
		)
	}
}

export const Redeem = connect(FxSelect.selectFxRate, FxActions.mapDispatchToProps)(RedeemClass);

