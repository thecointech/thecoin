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
  coinToSell: undefined as number | undefined,
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
  }

  async onSubmit(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();
    this.setState({doCancel: false, transferInProgress: true});
    // First, get the brokers fee
    const statusApi = new StatusApi();
    var status = await statusApi.status();

    this.setState({percentComplete: 0.3});
    if (this.state.doCancel)
      return;

    // Get our variables
    const {coinToSell, email} = this.state;
    const { wallet } = this.props.account;
    if (coinToSell === undefined || !wallet)
      return

    // To redeem, we construct & sign a message that 
    // that allows the broker to transfer TheCoin to itself
    const sellCommand = await TheContract.BuildVerifiedSale(email, wallet, status.address, coinToSell, status.certifiedFee);
    const sellApi = new SellApi();
    if (this.state.doCancel)
      return;

    // Send the command to the server
    this.setState({percentComplete: 0.7});
    const response = await sellApi.certifiedCoinSale(sellCommand);
    this.setState({percentComplete: 0.9});

    alert(response);
  }

  onValueChange(value: number) {
    this.setState({
      coinToSell: value
    })
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
        <Form.Input label="Your Email" placeholder="An email to recieve the e-Transfer" />
        <Form.Button onClick={this.onSubmit}>SEND</Form.Button>
      </Form>
      <ModalOperation cancelCallback={this.onCancelTransfer} isOpen={transferInProgress} header={messages.transferOutHeader} progressMessage={messages.transferOutProgress} progressPercent={this.state.percentComplete} />
      </React.Fragment>
    )
  }
}

export const Redeem = connect(selectFxRate)(RedeemClass)