import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Header, Button, List, Message } from 'semantic-ui-react';
import messages from './messages'
import { Referrals, SetUserVerified, NormalizeAddress } from '@the-coin/utilities';
import { UxAddress, SignerIdent } from '@the-coin/shared';
import { now } from 'utils/Firebase';

interface OwnProps {
	signer: SignerIdent.TheSigner,
}
type Props = OwnProps;

const initialState = {
	account: '',
	forceValidate: false,
	verifiedAccounts: [] as Referrals.VerifiedReferrer[]
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
		const billCollection = await Referrals.GetReferrersCollection();
		const allDocs = await billCollection.get();
		this.setState({
			verifiedAccounts: allDocs.docs.map(d => d.data() as Referrals.VerifiedReferrer)
		})
  }
  
	async verifyAccount(e: React.MouseEvent<HTMLElement>) {

		const { signer } = this.props;
		const { account } = this.state;
		if (!account)
			return;

		// We sign this account to show we approve of it
		const address = NormalizeAddress(account);
		const signature = await signer.signMessage(address)

		await SetUserVerified(signature, address, now());
		await Referrals.CreateReferrer(signature, address);
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
			const code = Referrals.GetReferrerCode(account.signature);
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