import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Header, Button, List, Message } from 'semantic-ui-react';
import { UxAddress } from '@thecointech/shared/components/UxAddress';
import messages from './messages'
import { getShortCode, NormalizeAddress } from '@thecointech/utilities';
import { setUserVerified } from '@thecointech/broker-db/user';
import { createReferrer, getReferrersCollection, VerifiedReferrer } from '@thecointech/broker-db/referrals';
import { DateTime } from 'luxon';
import { getSigner } from '@thecointech/signers';

const initialState = {
	account: '',
	forceValidate: false,
	verifiedAccounts: [] as VerifiedReferrer[]
}

//
//
class VerifyAccount extends React.PureComponent<{}, typeof initialState> {

	state = initialState;

	componentWillMount() {
		this.fetchExistingAccounts();
	}

	onAccountValue = (value: string) => {
		this.setState({
			account: value,
		});
	}
	onVerifyAccount = async (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		await this.verifyAccount(e);
		this.setState(initialState);
		await this.fetchExistingAccounts();
	}

	async fetchExistingAccounts() {
		const referrers = getReferrersCollection();
		const allDocs = await referrers.get();
		this.setState({
			verifiedAccounts: [...allDocs.docs].map(d => d.data())
		})
  }

	async verifyAccount(_e: React.MouseEvent<HTMLElement>) {

    const signer = await getSigner("BrokerCAD")
		const { account } = this.state;
		if (!account)
			return;

		// We sign this account to show we approve of it
		const address = NormalizeAddress(account);
		const signature = await signer.signMessage(address)

		await setUserVerified(signature, address, DateTime.now());
		await createReferrer(signature, address);
		alert('Done');
	}

	renderVerifiedAccounts()
	{
		const { verifiedAccounts } = this.state;
		if (verifiedAccounts === undefined)
			return <Message>Please wait, loading</Message>
		if (verifiedAccounts.length === 0)
			return <Message>No verified accounts found</Message>

		const verifiedList = verifiedAccounts.map(account => {
			const code = getShortCode(account.signature);
			return <List.Item key={account.address}>
				<List.Content>
					<List.Header>{code}</List.Header>
					{account.address}
				</List.Content>
			</List.Item>
		});
		return <List divided relaxed>{verifiedList}</List>
	}

	render() {
		const { forceValidate } = this.state;
		const verifiedAccounts = this.renderVerifiedAccounts();
		return (
			<React.Fragment>
				<Form>
					<Header as="h1">
						<Header.Content>
							<FormattedMessage {...messages.header} />
						</Header.Content>
						<Header.Subheader>
							<FormattedMessage {...messages.subHeader} />
						</Header.Subheader>
					</Header>
					<UxAddress
						uxChange={this.onAccountValue}
						forceValidate={forceValidate}
					/>
					<Button onClick={this.onVerifyAccount}>
						<FormattedMessage {...messages.buttonVerify} />
					</Button>
				</Form>
				{verifiedAccounts}
			</React.Fragment>
		);
	}
}

export { VerifyAccount }
