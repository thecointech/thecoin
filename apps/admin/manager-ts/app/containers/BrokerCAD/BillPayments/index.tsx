import React from "react";
import { GetFirestore } from "@the-coin/utilities/lib/Firestore";
import { AccountState } from "../../Account/types";

type Props = {
	account: AccountState
}

const initialState = {
	unsettledBills: [] as string[]
}

class BillPayments extends React.PureComponent<Props> {

	state = initialState;

	componentWillMount() {
		this.fetchBillsToSettle();
	}

	async fetchBillsToSettle() {
		const firestore = await GetFirestore()
		const billCollection = firestore.collection("Bill");
		const allDocs = await billCollection.get();
		this.setState({
			unsettledBills: allDocs.docs.map(d => d.get('ref'))
		})
	}

	render()
	{
		const allBills = this.state.unsettledBills.map(ref => <div>{ref}</div> );
		return (
			<React.Fragment>
				<div>Your Here</div>
				{allBills}
			</React.Fragment>
		)
	}
}

export { BillPayments }