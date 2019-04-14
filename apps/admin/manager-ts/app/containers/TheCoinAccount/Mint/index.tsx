import * as React from 'react';
//import styles from './index.module.css'
import { ContainerState as AccountState } from 'containers/Account/types'
import { toCoin, toHuman } from '@the-coin/utilities';
import { CancellableOperationModal } from 'containers/CancellableOperationModal';
import { Form, Header, Confirm } from 'semantic-ui-react';
import messages from './messages';

type MyProps = AccountState

class Mint extends React.PureComponent<MyProps> {

	state = {
		toMint: 0,
		toBurn: 0,
		amount: 0,
		toAddress: '',

		coinsAvailable: 0,
		txHash: '',
		isProcessing: false,

		doConfirm: false
	};

	constructor(props) {
		super(props);

		this.MintCoins = this.MintCoins.bind(this);
		this.MeltCoins = this.MeltCoins.bind(this);
		//this.SendPurchase = this.SendPurchase.bind(this);
	}

	handleCoinChange = (e, { name, value }) => this.setState({ [name]: toCoin(value) })

	SetAmount(e) {
		this.setState({ amount: toCoin(e.target.value) });
	}

	SetToAddress(e) {
		this.setState({ toAddress: e.target.value });
	}


	async UpdateAvailableCoins() {
		const { contract } = this.props;
		const available = await contract.reservedCoins();
		this.setState({ coinsAvailable: available.toNumber() })
	}

	async MintCoins() {
		const { toMint } = this.state;
		const { contract } = this.props;
		try {
			
			const tx = await contract.mintCoins(toMint);
			this.setState({ txHash: tx.hash })
			await tx.wait();
			await this.UpdateAvailableCoins();
		} catch (e) {
			alert(e);
		}
		this.setState({isProcessing: false})
	}

	MeltCoins() {

	}

	// SendPurchase() {
	// 	const { account, toAddress, amount } = this.state;

	// 	if (account.sign == null) {
	// 		console.error('Invalid account: sign in first');
	// 		return;
	// 	}
	// 	this.setState({
	// 		sendingState: <p>Initiate Transfer</p>
	// 	});
	// 	GetContract().coinPurchase(toAddress, amount, 15)
	// 		.then((transaction) => {
	// 			console.log(transaction);
	// 			this.setState({
	// 				sendingState: <p>Transfer Complete</p>
	// 			});
	// 			return this.UpdateAvailableCoins();
	// 		})
	// 		.catch(console.error.bind(console));
	// }

	confirmOpen = () => this.setState({ doConfirm: true })
	confirmClose = () => this.setState({ doConfirm: false })
	handleConfirm = () => {
		this.setState({ doConfirm: false })
	}

	render() {
		const { toMint, toBurn, coinsAvailable, isProcessing } = this.state
		return (
			<React.Fragment>
				<Header>Mint/Burn Coin</Header>
				<p>Current Balance: {coinsAvailable} </p>
				<Form>
					<Form.Field>
						<label>Mint Coins</label>
						<Form.Input placeholder='Coins to Mint' name='toMint' value={toHuman(toMint)} onChange={this.handleCoinChange} />
					</Form.Field>
					<Form.Field>
						<label>Burn Coins</label>
						<Form.Input placeholder='Coins to Burn' name='toMint' value={toHuman(toBurn)} onChange={this.handleCoinChange} />
					</Form.Field>
				</Form>
				<Confirm open={this.state.doConfirm} onCancel={this.confirmClose} onConfirm={this.confirmClose} />
				<CancellableOperationModal isOpen={isProcessing} header={messages.decryptHeader} progressMessage={messages.decryptInProgress} />
			</React.Fragment>
		);
	}
}

export { Mint }
