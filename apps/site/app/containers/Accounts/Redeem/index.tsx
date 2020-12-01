import * as React from 'react';
import { connect } from 'react-redux';
import { Form, Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import { BuildVerifiedSale } from '@the-coin/utilities/VerifiedSale';
import { DualFxInput } from '@the-coin/shared/components/DualFxInput';
import { FxRatesState } from '@the-coin/shared/containers/FxRate/types';
import { weBuyAt } from '@the-coin/shared/containers/FxRate/reducer';
import { selectFxRate } from '@the-coin/shared/containers/FxRate/selectors';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import { AccountState } from '@the-coin/shared/containers/Account/types';
import messages from './messages';
import { GetStatusApi, GetETransferApi } from 'api'
import styles from './styles.module.less';
import { ETransferPacket } from '@the-coin/types';

type MyProps = {
  account: AccountState;
};

type Props = MyProps & FxRatesState;

const initialState = {
  coinToSell: null as number | null,
  email: '',
  question: '',
  answer: '',
  message: undefined as string | undefined,
  transferInProgress: false,
  transferMessage: messages.transferOutProgress,
  transferValues: undefined as any,
  percentComplete: 0,
  doCancel: false,
};

type StateType = Readonly<typeof initialState>;

class RedeemClass extends React.PureComponent<Props, StateType> {
  state = initialState;

  async doSale() {
    // Init messages
    this.setState({ transferMessage: messages.step1, percentComplete: 0.0 });

    // First, get the brokers fee
    const statusApi = GetStatusApi();
    var {data} = await statusApi.status();
    // Check out if we have the right values
    if (!data.certifiedFee) return false;

    if (this.state.doCancel) return false;

    // Get our variables
    const { coinToSell, email, question, answer, message } = this.state;
    const { signer, contract } = this.props.account;
    if (coinToSell === null || !signer || !contract)
      return false;

    // To redeem, we construct & sign a message that
    // that allows the broker to transfer TheCoin to itself
    const eTransfer: ETransferPacket = {
      email, question, answer, message
    }
    const command = await BuildVerifiedSale(
      eTransfer,
      signer,
      data.address,
      coinToSell,
      data.certifiedFee,
    );
    const eTransferApi = GetETransferApi();

    if (this.state.doCancel)
      return false;

    // Send the command to the server
    this.setState({ transferMessage: messages.step2, percentComplete: 0.25 });
    const response = await eTransferApi.eTransfer(command);

    if (!response.data?.txHash) {
      console.log(`Error: ${JSON.stringify(response)}`);
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

  onSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    if (e) e.preventDefault();
    this.setState({
      doCancel: false,
      transferValues: undefined,
      transferInProgress: true,
    });
    try {
      const results = await this.doSale();
      if (!results) {
        alert(
          "We have encountered an error.\nDon't worry, your money is safe, but please still contact support@thecoin.io",
        );
      } else
        alert(
          'Order recieved.\nYou should receive the e-Transfer in 1-2 business days.',
        );
    } catch (e) {
      console.error(e);
      alert(e);
    }
    this.setState({ doCancel: false, transferInProgress: false });
  }

  onValueChange = (value: number) => {
    this.setState({
      coinToSell: value,
    });
  }

  onInputChanged = (event: React.FormEvent<HTMLInputElement>) => {
    const { value, name } = event.currentTarget;
    this.setState({
      [name]: value,
    } as any);
  }

  onCancelTransfer() {
    this.setState({ doCancel: true });
  }

  render() {
    const { account, rates } = this.props;
    const rate = weBuyAt(rates);
    const {
      coinToSell,
      transferInProgress,
      transferValues,
      transferMessage,
      percentComplete,
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
              value={coinToSell}
              fxRate={rate}
            />
            <Form.Input
              label="Recipient Email"
              name="email"
              onChange={this.onInputChanged}
              placeholder="An email address to send the e-Transfer to"
            />
            <Form.Input
              label="Security question"
              name="question"
              onChange={this.onInputChanged}
              placeholder="No numbers or special characters"
            />
            <Form.Input
              label="Security answer"
              name="answer"
              onChange={this.onInputChanged}
              placeholder="No spaces or special characters"
            />
            <Form.Input
              label="Message (optional)"
              name="message"
              type="text"
              onChange={this.onInputChanged}
              placeholder="An optional message to the recipient.  Should not include the security answer"
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

export const Redeem = connect(selectFxRate)(RedeemClass);
