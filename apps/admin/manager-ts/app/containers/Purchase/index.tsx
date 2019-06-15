import * as React from 'react';
import { connect } from 'react-redux';
import { Form, Header, Confirm } from 'semantic-ui-react';
import * as Datetime from 'react-datetime';
import { Moment } from 'moment';

import { toHuman } from '@the-coin/utilities';
import { roundPlaces } from '@the-coin/utilities/lib/Conversion';

import * as FxSelect from '@the-coin/components/containers/FxRate/selectors';
import * as FxAction from '@the-coin/components/containers/FxRate/actions';
import { getFxRate } from '@the-coin/components/containers/FxRate/reducer';
import { ModalOperation } from '@the-coin/components/containers/ModalOperation';
import { AccountState } from '@the-coin/components/containers/Account/types';
import { DualFxInput } from '@the-coin/components/components/DualFxInput';
import { UxAddress } from '@the-coin/components/components/UxAddress';

import messages from './messages';
import "react-datetime/css/react-datetime.css"
import { GetUserDoc } from '@the-coin/utilities/lib/User';
import { NextOpenTimestamp } from '@the-coin/utilities/lib/MarketStatus';
import { Timestamp, DocumentReference } from '@google-cloud/firestore';

interface PurchaseRecord {
	coin: number,
	fiat: number,
	created: Timestamp,
	txHash: string,
	emailHash: string,
	complete: boolean
}

type MyProps = AccountState & {
	updateBalance: Function
}
type Props = MyProps & FxSelect.ContainerState & FxAction.DispatchProps;

const initialState = {
	coin: 0,
	account: "",
	date: new Date(),

	email: "",

	txHash: '',
	step: "",
	isProcessing: false,

	doConfirm: false
}

class PurchaseClass extends React.PureComponent<Props> {

	state = initialState;

	async sendPurchase() {
		const { coin, account, date } = this.state;
		const { contract } = this.props;
		const fxRate = this.getSelectedFxRate()

		if (fxRate <= 0)
		{
			alert("Invalid FxRate!")
			return;
		}
		if (coin <= 0)
		{
			alert("Invalid Coin")
			return;
		}
		if (date.getTime() > Date.now()) 
		{
			alert("This set for a future date.\nIt is not possible to complete a purchase in the future.")
			return;
		}
		try {
			this.setState({isProcessing: true, step: "Initializing Transaction"});
			const ts = Math.round(date.getTime() / 1000);

			// First record our intent to send this tx
			var doc = await this.recordTxOpen();
			// Send the purchase request
			this.setState({isProcessing: true, step: "Sending Transaction"});

			const tx = await contract.coinPurchase(account, coin, 0, ts);
			// Update the DB with tx hash
			await this.recordTxHash(doc, tx.hash);

			// Wait for TX to complete on blockchain
			this.setState({ txHash: tx.hash, step: `Waiting on ${tx.hash}`} );
			await tx.wait();

			// Record successful tx
			this.setState({ step: `Finalizing`} );
			await this.recordTxComplete(doc);
			this.setState({isProcessing: false});
			alert("Purchase Success")
		} catch (e) {
			alert(e);
		}
		this.setState({isProcessing: false})
	}

	async buildPurchaseEntry() {
		const { coin, date, email } = this.state;
		const { wallet } = this.props;
		const fxRate = this.getSelectedFxRate();
		const emailHash = await wallet.signMessage(email.toLocaleLowerCase());
		return {
			coin,
			fiat: toHuman(coin * fxRate, true),
			created: Timestamp.fromDate(date),
			txHash: '---',
			emailHash,
			complete: false
		};
	}

	async recordTxOpen() {
		const { account, date } = this.state;
		const userDoc = GetUserDoc(account);
		// We use the timestamp as ID to ensure we have
		// a chance of catching duplicate purchases
		const purchaseId = date.getTime().toString();
		const purchaseDoc = userDoc.collection("Purchase").doc(purchaseId);

		try {
			const purchaseData = await purchaseDoc.get()
			if (purchaseData.exists) {
				throw new Error(`Purchase ${purchaseId} already exists: check tx ${JSON.stringify(purchaseData.data())}`)
			}

			const entry = await this.buildPurchaseEntry();
			purchaseDoc.set(entry);
			return purchaseDoc;
		}
		catch (err) {
			console.error(err);
			alert(err);
			throw err;
		}
	}

	async recordTxHash(purchaseDoc: DocumentReference, txHash: string) {
		try {
			const data: Partial<PurchaseRecord> = {
				txHash
			}
			await purchaseDoc.update(data);
		}
		catch (err) {
			console.error(err);
			alert(err);
			throw(err)
		}
	}

	async recordTxComplete(purchaseDoc: DocumentReference) {
		try {
			const data: Partial<PurchaseRecord> = {
				complete: true
			}
			await purchaseDoc.update(data);
		}
		catch (err) {
			console.error(err);
			alert(err);
			throw(err);
		}
	}

	async getValidDate(moment: Moment) {
		const asDate = moment.toDate();
		const nextTs = await NextOpenTimestamp(asDate);
		if (nextTs)
			return new Date(nextTs);
		return asDate;
	}

	onSetDate = async (value: string | Moment) => {
		const asm = value as Moment
		if (asm.toDate != undefined)
		{
			const asDate = await this.getValidDate(asm);
			this.setState({date: asDate});
			this.props.fetchRateAtDate(asDate);
		}
	}

	getSelectedFxRate() {
		const { date } = this.state;
		const { rates } = this.props;
		const rate = getFxRate(rates, date.getTime());
		return rate.sell * rate.fxRate;
	}

	resetInputs() {
		this.setState(initialState)
	}

	// Validate our inputs
	onAccountValue = (value: string) => {
		this.setState({
			account: value,
		});
	}
	handleCoinChange = (value: number) => this.setState({ coin: value })
	confirmOpen = () => this.setState({ doConfirm: true })
	confirmClose = () => this.setState({ doConfirm: false })
	handleConfirm = () => {
		this.setState({ doConfirm: false })
		this.sendPurchase()
		this.resetInputs();
	}

	render() {
		const { coin, date, isProcessing, step } = this.state
		const { balance } = this.props;
		const fxRate = this.getSelectedFxRate()

		const forceValidate = false;

		return (
			<React.Fragment>
				<Header>Mint Coin</Header>
				<p>Current Balance: {toHuman(balance, true)} </p>
				<Form>
					<Datetime value={date} onChange={this.onSetDate} />
					<p>FxRate: {roundPlaces(fxRate)} </p>
					<UxAddress
						uxChange={this.onAccountValue}
						intlLabel={messages.labelAccount}
						forceValidate={forceValidate}
						placeholder="Purchaser Account"
					/>
					<DualFxInput onChange={this.handleCoinChange} maxValue={balance} asCoin={true} value={coin} fxRate={fxRate} />
					<Form.Button onClick={this.confirmOpen}>SEND</Form.Button>
				</Form>
				<Confirm open={this.state.doConfirm} onCancel={this.confirmClose} onConfirm={this.handleConfirm} />
				<ModalOperation isOpen={isProcessing} header={messages.mintingHeader} progressMessage={messages.mintingInProgress} messageValues={{step}}/>
			</React.Fragment>
		);
	}
}

export const Purchase = connect(FxSelect.selectFxRate, FxAction.mapDispatchToProps)(PurchaseClass);

