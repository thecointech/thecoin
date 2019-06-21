import React from 'react';
import { Wallet } from 'ethers';
import { FormattedMessage } from 'react-intl';
import { Form, Header, Button, List } from 'semantic-ui-react';
import { UxAddress } from '@the-coin/components/components/UxAddress';
import messages from './messages'
import { NormalizeAddress } from '@the-coin/utilities';
import { CreateReferrer, VerifiedReferrer, GetReferrersCollection } from '@the-coin/utilities/lib/Referrals';
import { SetUserVerified } from '@the-coin/utilities/lib/User';

interface OwnProps {
	wallet: Wallet,
}
type Props = OwnProps;

const initialState = {
	account: '',
	forceValidate: false,
	verifiedAccounts: [] as VerifiedReferrer[]
}

//
// 
class VerifyAccount extends React.PureComponent<Props, typeof initialState> {

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
		const billCollection = await GetReferrersCollection();
		const allDocs = await billCollection.get();
		this.setState({
			verifiedAccounts: allDocs.docs.map(d => d.data() as VerifiedReferrer)
		})
	}

	async verifyAccount(e: React.MouseEvent<HTMLElement>) {

		const { wallet } = this.props;
		const { account } = this.state;
		if (!account)
			return;

		// We sign this account to show we approve of it
		const address = NormalizeAddress(account);
		const signature = await wallet.signMessage(address)

		await SetUserVerified(signature, address);
		await CreateReferrer(signature, address);
		alert('Done');
	}

	renderVerifiedAccounts()
	{
		const { verifiedAccounts } = this.state;
		const verifiedList = verifiedAccounts.map(account => (
			<List.Item>
				<List.Content>
					<List.Header>{account.signature.substr(2, 6)}</List.Header>
					{account.address}
				</List.Content>
			</List.Item>
		));
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