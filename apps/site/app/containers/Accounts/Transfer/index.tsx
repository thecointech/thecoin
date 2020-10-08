import * as React from 'react';
import { connect } from 'react-redux';
import { Form, Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import { NormalizeAddress } from '@the-coin/utilities';
import { BuildVerifiedXfer } from '@the-coin/utilities/VerifiedTransfer';
import { StatusApi, TransferApi } from '@the-coin/broker-cad';
import { DualFxInput } from '@the-coin/shared/components/DualFxInput';
import { UxAddress } from '@the-coin/shared/components/UxAddress';
import { FxRatesState } from '@the-coin/shared/containers/FxRate/types';
import { weBuyAt } from '@the-coin/shared/containers/FxRate/reducer';
import { selectFxRate } from '@the-coin/shared/containers/FxRate/selectors';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import { AccountState } from '@the-coin/shared/containers/Account/types';
import messages from './messages';
import styles from './styles.module.css';

type MyProps = {
  account: AccountState;
};

type Props = MyProps & FxRatesState;

const initialState = {
  coinTransfer: null as number | null,
  toAddress: '',
  forceValidate: false,

  transferInProgress: false,
  transferMessage: messages.transferOutProgress,
  transferValues: undefined as any,
  percentComplete: 0,
  doCancel: false,
};

type StateType = Readonly<typeof initialState>;

class TransferClass extends React.PureComponent<Props, StateType> {
  state = initialState;

  constructor(props: Props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.onAccountValue = this.onAccountValue.bind(this);
    this.onCancelTransfer = this.onCancelTransfer.bind(this);
  }

  async doTransfer() {
    // Init messages
    this.setState({ transferMessage: messages.step1, percentComplete: 0.0 });
    // First, get the brokers fee
    const statusApi = new StatusApi(); //undefined, "http://localhost:8080"
    var status = await statusApi.status();
    // Check out if we have the right values
    if (!status.data.certifiedFee) return false;

    if (this.state.doCancel) return false;

    // Get our variables
    const { coinTransfer, toAddress } = this.state;
    const { signer, contract } = this.props.account;
    if (coinTransfer === null || !signer || !contract) return false;

    // To transfer, we construct & sign a message that
    // that allows the broker to transfer TheCoin to another address
    const transferCommand = await BuildVerifiedXfer(
      signer,
      NormalizeAddress(toAddress),
      coinTransfer,
      status.data.certifiedFee,
    );
    const transferApi = new TransferApi();

    if (this.state.doCancel) return false;

    // Send the command to the server
    this.setState({ transferMessage: messages.step2, percentComplete: 0.25 });
    const response = await transferApi.transfer(transferCommand);

    console.log(`TxResponse: ${response.data.message}`);
    if (!response.data.txHash) {
      alert(response.data.message);
      return false;
    }

    // Wait on the given hash
    const transferValues = {
      link: (
        <a
          target="_blank"
          href={`https://ropsten.etherscan.io/tx/${response.data.txHash}`}
        >
          here
        </a>
      ),
    };
    this.setState({
      transferMessage: messages.step3,
      percentComplete: 0.5,
      transferValues,
    });
    const tx = await contract.provider.getTransaction(response.data.txHash);
    // Wait at least 2 confirmations
    tx.wait(2);
    const receipt = await contract.provider.getTransactionReceipt(
      response.data.txHash,
    );
    console.log(
      `Transfer mined in ${receipt.blockNumber} - ${receipt.blockHash}`,
    );
    this.setState({ percentComplete: 1 });
    return true;
  }

  async onSubmit(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();
    this.setState({
      doCancel: false,
      transferValues: undefined,
      transferInProgress: true,
    });
    try {
      const result = await this.doTransfer();
      if (!result) alert('Transfer Failure');
      else alert('Transfer Success');
    } catch (err) {
      console.error(err);
      alert('Transfer Error');
    }
    this.setState({ percentComplete: 1, transferInProgress: false });
  }

  onValueChange(value: number) {
    this.setState({
      coinTransfer: value,
    });
  }

  // Validate our inputs
  onAccountValue(value: string) {
    this.setState({
      toAddress: value,
    });
  }

  onCancelTransfer() {
    this.setState({ doCancel: true });
  }
  render() {
    const { account, rates } = this.props;
    const rate = weBuyAt(rates);
    const {
      coinTransfer,
      transferInProgress,
      transferMessage,
      forceValidate,
      percentComplete,
      transferValues,
    } = this.state;
    return (
      <React.Fragment>
        <div className={styles.wrapper}>
          <Form>
            <Header as="h1">
              <Header.Content>
                <FormattedMessage {...messages.header} />
              </Header.Content>
              <Header.Subheader>
                <FormattedMessage {...messages.subHeader} />
              </Header.Subheader>
            </Header>

            <DualFxInput
              onChange={this.onValueChange}
              asCoin={true}
              maxValue={account.balance}
              value={coinTransfer}
              fxRate={rate}
            />
            <UxAddress
              uxChange={this.onAccountValue}
              forceValidate={forceValidate}
              placeholder="Destination Address"
            />
            <Form.Button onClick={this.onSubmit}>SEND</Form.Button>
          </Form>
          <ModalOperation
            cancelCallback={this.onCancelTransfer}
            isOpen={transferInProgress}
            header={messages.transferOutHeader}
            progressMessage={transferMessage}
            progressPercent={percentComplete}
            messageValues={transferValues}
          />
        </div>
      </React.Fragment>
    );
  }
}

export const Transfer = connect(selectFxRate)(TransferClass);
