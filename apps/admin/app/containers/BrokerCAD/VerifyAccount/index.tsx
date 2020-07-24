import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Header, Button, List, Message } from 'semantic-ui-react';
import { UxAddress } from '@the-coin/shared/components/UxAddress';
import messages from './messages'
import { NormalizeAddress } from '@the-coin/utilities';
import { CreateReferrer, VerifiedReferrer, GetReferrersCollection, GetReferrerCode } from '@the-coin/utilities/Referrals';
import { SetUserVerified } from '@the-coin/utilities/User';
import { TheSigner } from '@the-coin/shared/SignerIdent';
import { Timestamp } from '@the-coin/utilities/firestore';


interface OwnProps {
	signer: TheSigner,
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

	async verifyAccount(_e: React.MouseEvent<HTMLElement>) {

		const { signer } = this.props;
		const { account } = this.state;
		if (!account)
			return;

		// We sign this account to show we approve of it
		const address = NormalizeAddress(account);
		const signature = await signer.signMessage(address)

		await SetUserVerified(signature, address, Timestamp.now());
		await CreateReferrer(signature, address);
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
			const code = GetReferrerCode(account.signature);
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
