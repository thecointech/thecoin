import React from 'react';
import { Wallet } from 'ethers';
import { FormattedMessage } from 'react-intl';
import { Form, Header, Button } from 'semantic-ui-react';
import { UxAddress } from '@the-coin/components/components/UxAddress';
import messages from './messages'
import { NormalizeAddress } from '@the-coin/utilities';
import { CreateReferrer } from '@the-coin/utilities/lib/Referrals';
import { SetUserVerified } from '@the-coin/utilities/lib/User';

interface OwnProps {
	wallet: Wallet,
}
type Props = OwnProps;

class VerifyAccount extends React.PureComponent<Props, {}, null> {

	state = {
		account: '',
		forceValidate: false
	};

	constructor(props) {
		super(props);
		this.onAccountValue = this.onAccountValue.bind(this);
		this.verifyAccount = this.verifyAccount.bind(this);
	}

	// Validate our inputs
	onAccountValue(value: string) {
		this.setState({
			account: value,
		});
	}

	async verifyAccount(e: React.MouseEvent<HTMLElement>) {
		if (e) e.preventDefault();

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

	render() {
		const { forceValidate } = this.state;
     
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
					<Button onClick={this.verifyAccount}>
						<FormattedMessage {...messages.buttonVerify} />
					</Button>
				</Form>
			</React.Fragment>
		);
	}
}

export { VerifyAccount }