import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { connect } from "react-redux"
import * as TheCadBroker from '@the-coin/broker-cad';

class Confirm extends React.PureComponent {
	state = {
		disabled: true
	}

	enableConfirm = (e, v) => {
		this.setState({disabled: e.checked});
	}

	setConfirmed = async (e) => {
		if (e)
			e.preventDefault();

		const { user, id, account } = this.props;
		const purchaseApi = new TheCadBroker.PurchaseApi();
		const timestamp = new Date().getTime();
		const sig = await account.signMessage(timestamp.toString() + id.toString());
		const confirmation = new TheCadBroker.SignedPurchaseConfirm(timestamp, sig);
		try {		
			const res = await purchaseApi.confirmCoinPurchase(user, id, confirmation);
			this.props.order.confirm = confirmation;
		}
		catch(err) {
			alert(err);
			console.error(err);
		}
	};

	render() {
		const { order, account } = this.props;
		let { disabled } =  this.state;
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

