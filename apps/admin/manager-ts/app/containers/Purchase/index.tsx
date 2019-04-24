import * as React from 'react';
import { connect } from 'react-redux';
import { Form, Header, Confirm } from 'semantic-ui-react';
import * as Datetime from 'react-datetime';
import { Moment } from 'moment';
import { google } from '@google-cloud/datastore/build/proto/datastore';
import { entity } from '@google-cloud/datastore/build/src/entity';

//import styles from './index.module.css'
import * as FxSelect from '@the-coin/react-components/lib/containers/FxRate/selectors';
import * as FxAction from '@the-coin/react-components/lib/containers/FxRate/actions';
import { getFxRate } from '@the-coin/react-components/lib/containers/FxRate/reducer';
import { ModalOperation } from '@the-coin/react-components/lib/containers/ModalOperation';
import { toHuman } from '@the-coin/utilities';

import { ContainerState as AccountState } from 'containers/Account/types'
import { DualFxInput } from 'components/DualFxInput';
import messages from './messages';

import { ds } from 'containers/Datastore';

import "react-datetime/css/react-datetime.css"
import { roundPlaces } from '@the-coin/utilities/lib/Conversion';
import { UxInput } from 'components/UxInput';

type MyProps = AccountState & {
	updateBalance: Function
}
type Props = MyProps & FxSelect.ContainerState & FxAction.DispatchProps;

class PurchaseClass extends React.PureComponent<Props> {

	state = {
		coin: 0,
		account: "",
		accountValid: false,
		date: new Date(),

		txHash: '',
		step: "",
		isProcessing: false,

		doConfirm: false
	};

	constructor(props) {
		super(props);

		this.onAccountValue = this.onAccountValue.bind(this);
		
		this.confirmOpen = this.confirmOpen.bind(this);
		this.confirmClose = this.confirmClose.bind(this);
		this.handleConfirm = this.handleConfirm.bind(this);
	}

	// TODO: remove once utilities updated
	IsValidAddress = (address: string) => /^(0x)?[a-gA-G0-9]{40}$/.test(address);
	NormalizeAddress = (address: string) => address.length == 40 ? `0x${address.toUpperCase()}` : `0x${address.slice(2).toUpperCase()}`

	// Validate our inputs
	onAccountValue(value: string) {
		this.setState({
			account: value,
			accountValid: this.IsValidAddress(value)
		});
	}

	handleCoinChange = (value: number) => this.setState({ coin: value })

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
		try {
			this.setState({isProcessing: true, step: "Initializing Transaction"});
			const ts = Math.round(date.getTime() / 1000);

			// First record our intent to send this tx
			var key = await this.recordTxOpen();
			// Send the purchase request
			this.setState({isProcessing: true, step: "Sending Transaction"});

			const tx = await contract.coinPurchase(account, coin, 0, ts);
			// Update the DB with tx hash
			await this.recordTxHash(key, tx.hash);

			// Wait for TX to complete on blockchain
			this.setState({ txHash: tx.hash, step: `Waiting on ${tx.hash}`} );
			await tx.wait();

			// Record successful tx
			this.setState({ step: `Finalizing`} );
			await this.recordTxComplete(key, tx.hash);
			this.setState({isProcessing: false});
			alert("Purchase Success")
		} catch (e) {
			alert(e);
		}
		this.setState({isProcessing: false})
	}

	buildPurchaseEntry() {
		const { coin, date } = this.state;
		const fxRate = this.getSelectedFxRate();
		return {
			coin,
			fiat: toHuman(coin * fxRate, true),
			date,
			txHash: '---',
			complete: false
		}
	}

	async recordTxOpen() {
		const { account } = this.state;
		let normalized = this.NormalizeAddress(account);
		const userKey = ds.key(['User', normalized, "Purchase"])
		const entry = this.buildPurchaseEntry();
		try {
			// Here we cast to any because the type implies
			// that ra is an ICommitResult but it's really an array
			const ra: any = await ds.insert({
				key: userKey,
				data: entry
			})
			const response:google.datastore.v1.ICommitResponse = ra[0];
			const id = response.mutationResults[0].key.path[1].id;
			return ds.key(['User', normalized, "Purchase", parseInt("" + id)])
		}
		catch (err) {
			console.error(err);
			alert(err);
		}
	}

	async recordTxHash(key: entity.Key, txHash: string) {
		const entry = this.buildPurchaseEntry();
		try {
			await ds.update({
				key: key,
				data: {
					...entry,
					txHash: txHash
				}
			})
		}
		catch (err) {
			console.error(err);
			alert(err);
		}
	}

	async recordTxComplete(key: entity.Key, txHash: string) {
		const entry = this.buildPurchaseEntry();
		try {
			await ds.update({
				key: key,
				data: {
					...entry,
					txHash: txHash,
					complete: true
				}
			})
		}
		catch (err) {
			console.error(err);
			alert(err);
		}
	}

	onSetDate = (value: string | Moment) => {
		const asm = value as Moment
		if (asm.toDate != undefined)
		{
			const asDate = asm.toDate();
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

	confirmOpen = () => this.setState({ doConfirm: true })
	confirmClose = () => this.setState({ doConfirm: false })
	handleConfirm = () => {
		this.setState({ doConfirm: false })
		this.sendPurchase()
	}

	render() {
		const { coin, date, isProcessing, step, accountValid } = this.state
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
					<UxInput
						uxChange={this.onAccountValue}
						intlLabel={messages.labelAccount}
						forceValidate={forceValidate}
						isValid={accountValid}
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

