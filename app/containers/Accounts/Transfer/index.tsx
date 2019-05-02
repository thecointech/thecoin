import * as React from 'react';
import { connect } from 'react-redux';
import { Form, Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import { TheContract, NormalizeAddress } from '@the-coin/utilities';
import { StatusApi, TransferApi } from '@the-coin/broker-cad';
import { DualFxInput } from '@the-coin/components/components/DualFxInput';
import { UxAddress } from '@the-coin/components/components/UxAddress';
import { ContainerState as FxState } from '@the-coin/components/containers/FxRate/types'
import { weBuyAt } from '@the-coin/components/containers/FxRate/reducer';
import { selectFxRate } from '@the-coin/components/containers/FxRate/selectors'
import { ModalOperation } from '@the-coin/components/containers/ModalOperation';
import { AccountState } from '@the-coin/components/containers/Account/types';
import messages from './messages';

type MyProps = {
  account: AccountState
}

type Props = MyProps & FxState;

const initialState = {
  coinTransfer: undefined as number | undefined,
  toAddress: "",
  forceValidate: false,

  transferInProgress: false,
  percentComplete: 0,
  doCancel: false
}

type StateType = Readonly<typeof initialState>

class TransferClass extends React.PureComponent<Props, StateType> {

  state = initialState;

  constructor(props: Props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
	this.onValueChange = this.onValueChange.bind(this);
	this.onAccountValue = this.onAccountValue.bind(this);
	this.onCancelTransfer = this.onCancelTransfer.bind(this);
  }

  async doTransfer()
  {
	// First, get the brokers fee
	const statusApi = new StatusApi(undefined, "http://localhost:8080");
	var status = await statusApi.status();
	// Check out if we have the right values
	if (!status.certifiedFee)
		return false;

    this.setState({percentComplete: 0.2});
    if (this.state.doCancel)
      return false;

    // Get our variables
    const { coinTransfer, toAddress } = this.state;
    const { wallet, contract } = this.props.account;
    if ( coinTransfer === undefined || !wallet || !contract)
      return false;

    // To transfer, we construct & sign a message that 
    // that allows the broker to transfer TheCoin to another address
    const transferCommand = await TheContract.BuildVerifiedXfer(wallet, NormalizeAddress(toAddress), coinTransfer, status.certifiedFee, Date.now());
    const transferApi = new TransferApi(undefined, "http://localhost:8080")

	if (this.state.doCancel)
       return false;

    // // Send the command to the server
    this.setState({percentComplete: 0.4});
    const response = await transferApi.makeCertifiedTransfer(transferCommand);
	this.setState({percentComplete: 0.8});

	console.log(`TxResponse: ${response.message}`);
	if (!response.txHash)
	{
		alert(response.message);
		return false;
	}

	// Wait on the given hash
	const receipt = await contract.provider.getTransactionReceipt(response.txHash);
	console.log(`Transfer mined in ${receipt.blockNumber} - ${receipt.blockHash}`)
	this.setState({percentComplete: 1 });
	alert("Transfer Success");
	return true;
  }

  async onSubmit(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();
	this.setState({doCancel: false, transferInProgress: true});
	
	const result = await this.doTransfer();
	if (!result)
		alert("Transfer Failure");

	this.setState({percentComplete: 1, transferInProgress: false});
  }

  onValueChange(value: number) {
    this.setState({
       coinTransfer: value
    })
  }

	// Validate our inputs
	onAccountValue(value: string) {
		this.setState({
			toAddress: value,
		});
	}

  onCancelTransfer() {
    this.setState({doCancel: true});
  }
	render() {
		const { account, rates } = this.props;
		const rate = weBuyAt(rates);
		const {  coinTransfer, transferInProgress, forceValidate } = this.state;
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
	
			<DualFxInput onChange={this.onValueChange} asCoin={true} maxValue={account.balance} value={ coinTransfer} fxRate={rate} />
			<UxAddress 
				uxChange={this.onAccountValue}
				forceValidate={forceValidate}
				placeholder="Destination Address"
			/>
			<Form.Button onClick={this.onSubmit}>SEND</Form.Button>
		  </Form>
		  <ModalOperation cancelCallback={this.onCancelTransfer} isOpen={transferInProgress} header={messages.transferOutHeader} progressMessage={messages.transferOutProgress} progressPercent={this.state.percentComplete} />
		  </React.Fragment>
		)
	  }
}

export const Transfer = connect(selectFxRate)(TransferClass)