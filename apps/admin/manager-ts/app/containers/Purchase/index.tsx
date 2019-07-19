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
import { GetWallet } from 'containers/BrokerTransferAssistant/Wallet';
import { utils } from 'ethers';
import { GetReferrerCode } from '@the-coin/utilities/lib/Referrals';

interface PurchaseRecord {
	coin: number,
	fiat: number,
	recieved: Timestamp,
	settled: Timestamp,
	completed: Timestamp,
	txHash: string,
	emailHash: string
}

type MyProps = AccountState & {
	updateBalance: Function
}
type Props = MyProps & FxSelect.ContainerState & FxAction.DispatchProps;

const initialState = {
	coin: 0,
	account: "",
	purchaserCode: "---",

	recievedDate: new Date(),
	settledDate: new Date(),

	email: "",

	txHash: '',
	step: "",
	isProcessing: false,

	doConfirm: false
}

// Todo: move SignMessage-y fn's to utilities
function GetHash(
  value: string
) {
  const ethersHash = utils.solidityKeccak256(
    ["string"],
    [value]
  );
  return utils.arrayify(ethersHash);
}

class PurchaseClass extends React.PureComponent<Props> {

	state = initialState;

	async sendPurchase() {
		const { coin, account, settledDate } = this.state;
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
		if (settledDate.getTime() > Date.now()) 
		{
			alert("This set for a future date.\nIt is not possible to complete a purchase in the future.")
			return;
		}
		try {
			this.setState({isProcessing: true, step: "Initializing Transaction"});
			const ts = Math.round(settledDate.getTime() / 1000);

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
		this.setState(initialState)
	}

	async buildPurchaseEntry() : Promise<PurchaseRecord> {
		const { coin, recievedDate, settledDate, email } = this.state;
		const { signer } = this.props;
		const fxRate = this.getSelectedFxRate();
		const emailHash = await signer.signMessage(email.toLocaleLowerCase());
		return {
			coin,
			fiat: toHuman(coin * fxRate, true),
			recieved: Timestamp.fromDate(recievedDate),
			settled: Timestamp.fromDate(settledDate),
			txHash: '---',
			emailHash,
			completed: null
		};
	}

	async recordTxOpen() {
		const { account, recievedDate } = this.state;
		const userDoc = await GetUserDoc(account);
		// We use the timestamp as ID to ensure we have
		// a chance of catching duplicate purchases
		const purchaseId = recievedDate.getTime().toString();
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
				completed: Timestamp.now()
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
			this.setState({
				recievedDate: asm.toDate(),
				settledDate: asDate
			});
			this.props.fetchRateAtDate(asDate);
		}
	}

	getSelectedFxRate() {
		const { settledDate } = this.state;
		const { rates } = this.props;
		const rate = getFxRate(rates, settledDate.getTime());
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
		this.updateCode(value);
	}
	handleCoinChange = (value: number) => this.setState({ coin: value })
	confirmOpen = () => this.setState({ doConfirm: true })
	confirmClose = () => this.setState({ doConfirm: false })
	handleConfirm = async () => {
		this.setState({ doConfirm: false })
		await this.sendPurchase()
		this.resetInputs();
	}

	async updateCode(account: string) {
		const wallet = await GetWallet();
		const rhash = GetHash(account.toLowerCase());
		const rsign = await wallet.signMessage(rhash);
		const code = GetReferrerCode(rsign);
		this.setState({purchaserCode: code});
	}

	render() {
		const { coin, recievedDate, settledDate, isProcessing, step, purchaserCode } = this.state
		const { balance } = this.props;
		const fxRate = this.getSelectedFxRate()

		const forceValidate = false;

		return (
			<React.Fragment>
				<Header>Purchase</Header>
				<p>Current Balance: {toHuman(balance, true)} </p>
				<Form>
					<Datetime value={recievedDate} onChange={this.onSetDate} />
					<p>Settled: {settledDate.toString()}</p>
					<p>FxRate: {roundPlaces(fxRate)} </p>
					<UxAddress
						uxChange={this.onAccountValue}
						intlLabel={messages.labelAccount}
						forceValidate={forceValidate}
						placeholder="Purchaser Account"
					/>
					<p>Purchaser Code: {purchaserCode}</p>
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

