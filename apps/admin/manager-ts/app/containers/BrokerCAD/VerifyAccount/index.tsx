import React from 'react';
import { UxInput } from 'components/UxInput';
import { Wallet } from 'ethers';
import { FormattedMessage } from 'react-intl';
import { Form, Header, Button } from 'semantic-ui-react';
import { ds } from 'containers/Datastore';
import base32 from 'base32';
import messages from './messages'

interface OwnProps {
	wallet: Wallet,
}
type Props = OwnProps;

class VerifyAccount extends React.PureComponent<Props, {}, null> {

	state = {
		account: '',

		accountValid: undefined as boolean | undefined,
		accountMessage: undefined as FormattedMessage.MessageDescriptor | undefined,

		forceValidate: false
	};

	constructor(props) {
		super(props);
		this.onAccountValue = this.onAccountValue.bind(this);
		this.verifyAccount = this.verifyAccount.bind(this);
	}

	// TODO: remove once utilities updated
	IsValidAddress = (address: string) => /^(0x)?[a-g0-9]{40}$/i.test(address);
	NormalizeAddress = (address: string) => address.length == 40 ? `0x${address.toUpperCase()}` : address.toUpperCase()

	// Validate our inputs
	onAccountValue(value: string) {
		this.setState({
			account: value,
			accountValid: this.IsValidAddress(value)
		});
	}

	async setUserVerified(signature: string, account: string) {
		const userKey = ds.key(['User', account])
		// We store the verified signature
		var [userMeta] = await ds.get(userKey);
		// Add the verified tag to the users metadata
		userMeta = {
			...(userMeta || {}),
			verified: signature
		}
		await ds.upsert({
			key: userKey,
			data: userMeta
		})
	}

	getReferrerCode(signature: string) {
		const normSig = signature[1] == 'x' ? signature.slice(2) : signature;
		const buffer = Buffer.from(normSig, 'hex');
		const s2: string = base32.encode(buffer);
		return s2.slice(-6);
	}

	async setReferrer(signature: string, address: string) {
		const referrerCode = this.getReferrerCode(signature);
		const referrerKey = ds.key(['Referrer', referrerCode])
		await ds.insert({
			key: referrerKey,
			data: {
				address,
				signature
			}
		})
	}

	async verifyAccount(e: React.MouseEvent<HTMLElement>) {
		if (e) e.preventDefault();

		const { wallet } = this.props;
		const { account, accountValid } = this.state;
		if (!accountValid)
			return;

		// We sign this account to show we approve of it
		const address = this.NormalizeAddress(account);
		const signature = await wallet.signMessage(address)

		await this.setUserVerified(signature, address);
		await this.setReferrer(signature, address);
		alert('Done');
	}

	render() {
		const { forceValidate, accountValid, accountMessage } = this.state;
     
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
					<UxInput
						uxChange={this.onAccountValue}
						intlLabel={messages.labelAccount}
						forceValidate={forceValidate}
						isValid={accountValid}
						message={accountMessage}
						placeholder="Account Name"
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