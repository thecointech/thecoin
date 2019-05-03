import * as React from 'react';
import { connect } from 'react-redux';
import { Form, Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import { TheContract } from '@the-coin/utilities';
import { StatusApi, SellApi } from '@the-coin/broker-cad';
import { DualFxInput } from '@the-coin/components/components/DualFxInput';
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
  coinToSell: null as number | null,
  email: "",
  transferInProgress: false,
  percentComplete: 0,
  doCancel: false
}

type StateType = Readonly<typeof initialState>

class RedeemClass extends React.PureComponent<Props, StateType> {

  state = initialState;

  constructor(props: Props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.onEmailChange = this.onEmailChange.bind(this);
    
  }

  async doSale() {

    // First, get the brokers fee
    const statusApi = new StatusApi();
    var status = await statusApi.status();
    // Check out if we have the right values
    if (!status.certifiedFee)
      return false;

    this.setState({percentComplete: 0.2});
    if (this.state.doCancel)
      return false;

    // Get our variables
    const {coinToSell, email} = this.state;
    const { wallet, contract } = this.props.account;
    if (coinToSell === null || !wallet || !contract)
      return false;

    // To redeem, we construct & sign a message that 
    // that allows the broker to transfer TheCoin to itself
    const sellCommand = await TheContract.BuildVerifiedSale(email, wallet, status.address, coinToSell, status.certifiedFee);
    const sellApi = new SellApi();
    if (this.state.doCancel)
      return false;

    // Send the command to the server
    this.setState({percentComplete: 0.4});
    const response = await sellApi.certifiedCoinSale(sellCommand);
    this.setState({percentComplete: 0.8});
    console.log(`Response: ${response.message}`);
    return response.txHash ? response.message : false;
  }

  async onSubmit(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();
    try {
      this.setState({doCancel: false, transferInProgress: true});
      const results = await this.doSale();  
      if (!results) {
        alert('We have encountered an error.\nDon\'t worry, your money is safe, but please still contact support');
      }
      else alert('Order received.\nYou should receive the e-Transfer in 1-2 business days.');
    }
    catch(e) {
      alert(e);
    }
    this.setState({doCancel: false, transferInProgress: false});
  }

  onValueChange(value: number) {
    this.setState({
      coinToSell: value
    })
  }

  onEmailChange(event: React.FormEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;
    this.setState({
      email: value,
    });
  }

  onCancelTransfer() {
    this.setState({doCancel: true});
  }

  render() {
    const { account, rates } = this.props;
    const rate = weBuyAt(rates);
    const { coinToSell, transferInProgress } = this.state;
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

        <DualFxInput onChange={this.onValueChange} asCoin={true} maxValue={account.balance} value={coinToSell} fxRate={rate} />
        <Form.Input label="Your Email" onChange={this.onEmailChange} placeholder="An email to recieve the e-Transfer" />
        <Form.Button onClick={this.onSubmit}>SEND</Form.Button>
      </Form>
      <ModalOperation cancelCallback={this.onCancelTransfer} isOpen={transferInProgress} header={messages.transferOutHeader} progressMessage={messages.transferOutProgress} progressPercent={this.state.percentComplete} />
      </React.Fragment>
    )
  }
}

export const Redeem = connect(selectFxRate)(RedeemClass)