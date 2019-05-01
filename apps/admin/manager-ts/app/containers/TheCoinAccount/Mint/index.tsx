import * as React from 'react';
//import styles from './index.module.css'
import { Form, Header, Confirm } from 'semantic-ui-react';
import { connect } from 'react-redux';
import messages from './messages';
import { DualFxInput } from 'components/DualFxInput';
import { ModalOperation } from '@the-coin/components/containers/ModalOperation';
import { selectFxRate, ContainerState as FxRates } from '@the-coin/components/containers/FxRate/selectors';
import { weSellAt } from '@the-coin/components/containers/FxRate/reducer';
import { toHuman } from '@the-coin/utilities';
import { AccountState } from '@the-coin/components/containers/Account/types'
import { DispatchProps } from '@the-coin/components/containers/Account/actions'

type MyProps = AccountState & {
	updateBalance: Function
}
type Props = MyProps & FxRates & DispatchProps;

class MintClass extends React.PureComponent<Props> {

	state = {
		toMint: 0,

		txHash: '',
		isProcessing: false,

		doConfirm: false
	};

	constructor(props) {
		super(props);

		this.confirmOpen = this.confirmOpen.bind(this);
		this.confirmClose = this.confirmClose.bind(this);
		this.handleConfirm = this.handleConfirm.bind(this);
	}

	handleCoinChange = (value: number) => this.setState({ toMint: value })

	// async UpdateAvailableCoins() {
	// 	const { contract } = this.props;
	// 	const available = await contract.reservedCoins();
	// 	this.setState({ coinsAvailable: available.toNumber() })
	// }

	async mintCoins() {
		const { toMint } = this.state;
		const { contract } = this.props;
		try {
			this.setState({isProcessing: true});
			const tx = await contract.mintCoins(toMint);
			this.setState({ txHash: tx.hash })
			await tx.wait();
			//await this.UpdateAvailableCoins();
			this.props.updateBalance();
			this.setState({isProcessing: false});
		} catch (e) {
			alert(e);
		}
		this.setState({isProcessing: false})
	}

	confirmOpen = () => this.setState({ doConfirm: true })
	confirmClose = () => this.setState({ doConfirm: false })
	handleConfirm = () => {
		this.setState({ doConfirm: false })
		this.mintCoins()
	}

	render() {
		const { toMint, isProcessing, txHash } = this.state
		const { rates, balance } = this.props;
		const fxRate = weSellAt(rates);
		return (
			<React.Fragment>
				<Header>Mint Coin</Header>
				<p>Current Balance: {toHuman(balance, true)} </p>
				<Form>
					<DualFxInput onChange={this.handleCoinChange} asCoin={true} value={toMint} fxRate={fxRate} />
					<Form.Button onClick={this.confirmOpen}>MINT</Form.Button>
				</Form>
				<Confirm open={this.state.doConfirm} onCancel={this.confirmClose} onConfirm={this.handleConfirm} />
				<ModalOperation isOpen={isProcessing} header={messages.mintingHeader} progressMessage={messages.mintingInProgress} messageValues={{txHash}}/>
			</React.Fragment>
		);
	}
}

export const Mint = connect(selectFxRate)(MintClass);

