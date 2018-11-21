import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { connect } from "react-redux"
import * as TheCadBroker from '@the-coin/broker-cad';

class Confirm extends React.PureComponent {
	state = {
		disabled: true
	}

	enableConfirm = (e, v) => {
		this.setState(e.checked);
	}

	setConfirmed = () => {
		const { user, id, account } = this.props;
		const purchaseApi = new TheCadBroker.PurchaseApi();
		const timestamp = new Date().getTime();
		const sig = account.account.signMessage(timestamp.toString() + id.toString());
		const confirmation = new TheCadBroker.SignedPurchaseConfirm(timestamp, sig);
		purchaseApi.confirmCoinPurchase(user, id, confirmation)
			.then((res) => {
				this.props.order.confirm = confirmation;
			})
	};
	render() {
		const { order, account } = this.props;
		const { disabled } =  this.state;
		let toDisplay = null;
		if (order.confirm) {
			toDisplay = <p>Confirmed: {new Date(order.confirm.timestamp).toString()}</p>;
		}
		else {
			toDisplay = <Form.Check disabled={!account} type='checkbox' onChange={this.enableConfirm} label="Purchase Confirmed" />
		}
		// Generate the right sub-content depending on which page we're in.
		return (
			<Form>
				<div key={`default-checkbox`} className="mb-3">
				{toDisplay}
				<Button disabled={disabled} variant="primary" type="submit" onClick={this.setConfirmed}>
					Submit
				</Button>
				</div>
			</Form>
		);
	}
}
const mapStateToProps = state => ({
	account: state.AccountsRedux.account
})

export default connect(mapStateToProps)(Confirm)

