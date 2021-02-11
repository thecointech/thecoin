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
import { GetStatusApi, GetETransferApi } from 'api'
import { ETransferPacket } from '@the-coin/types';
import { ButtonPrimary } from '@the-coin/site-base/components/Buttons';

type MyProps = {
  account: AccountState;
};

type Props = MyProps & FxRatesState;

const errorMessage = { id:"app.accounts.redeem.errorMessage",
                defaultMessage:"We have encountered an error. Don't worry, your money is safe, but please still contact support@thecoin.io",
                description:"Error Message for the make a payment page / etransfert tab" };
const successMessage = { id:"app.accounts.redeem.successMessage",
                defaultMessage:"Order recieved.\nYou should receive the e-Transfer in 1-2 business days.",
                description:"Success Message for the make a payment page / etransfert tab" };
const description = { id:"app.accounts.redeem.description",
                defaultMessage:"Email money to anyone with an interac e-Transfer.",
                description:"Description for the make a payment page / etransfert tab" };
const email = { id:"app.accounts.redeem.form.email",
                defaultMessage:"Recipient email",
                description:"Label for the form the make a payment page / etransfert tab" };
const question = { id:"app.accounts.redeem.form.question",
                defaultMessage:"Security question",
                description:"Label for the form the make a payment page / etransfert tab" };
const answer= { id:"app.accounts.redeem.form.answer",
                defaultMessage:"Security answer",
                description:"Label for the form the make a payment page / etransfert tab" };
const message= { id:"app.accounts.redeem.form.message",
                defaultMessage:"Message (optional)",
                description:"Label for the form the make a payment page / etransfert tab" };

const step1= { id:"app.accounts.redeem.step1",
                defaultMessage:"Step 1 of 3: Checking order availability..." };
const step2= { id:"app.accounts.redeem.step2",
                defaultMessage:"Step 2 of 3: Sending sell order to our servers..." };
const step3= { id:"app.accounts.redeem.step3",
                defaultMessage:"Step 3 of 3: Waiting for the order to be accepted\n(check progress {link})..." };

const transferOutHeader= { id:"app.accounts.redeem.transferOutHeader",
                defaultMessage:"Processing Transfer out..." };
const transferOutProgress= { id:"app.accounts.redeem.transferOutHeader",
                defaultMessage:"Please wait, we are sending your order to our servers..." };

const button = { id:"app.accounts.redeem.button",
                defaultMessage:"Send",
                description:"For the button in the make a payment page / etransfert tab" };


const initialState = {
  coinToSell: null as number | null,
  email: '',
  question: '',
  answer: '',
  message: undefined as string | undefined,
  transferInProgress: false,
  transferMessage: transferOutProgress,
  transferValues: undefined as any,
  percentComplete: 0,
  doCancel: false,
};

type StateType = Readonly<typeof initialState>;

class RedeemClass extends React.PureComponent<Props, StateType> {
  state = initialState;

  async doSale() {
    // Init messages
    this.setState({ transferMessage: {...step1}, percentComplete: 0.0 });

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
    this.setState({ transferMessage: {...step2}, percentComplete: 0.25 });
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
      transferMessage: step3,
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
        alert(<FormattedMessage {...errorMessage} />);
      } else
        alert(<FormattedMessage {...successMessage} />);
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

  onCancelTransfer = () => this.setState({ doCancel: true });

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
        <div>
          <Form>
            <Header as="h5">
              <Header.Subheader>
                <FormattedMessage {...description} />
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
              className={"borderTop borderBottom"}
              label={<FormattedMessage {...email} />}
              name="email"
              onChange={this.onInputChanged}
              placeholder="An email address to send the e-Transfer to"
            />
            <Form.Input
              className={"half left"}
              label={<FormattedMessage {...question} />}
              name="question"
              onChange={this.onInputChanged}
              placeholder="No numbers or special characters"
            />
            <Form.Input
              className={"half right"}
              label={<FormattedMessage {...answer} />}
              name="answer"
              onChange={this.onInputChanged}
              placeholder="No spaces or special characters"
            />
            <Form.Input
              className={"borderTop"}
              label={<FormattedMessage {...message} />}
              name="message"
              type="text"
              onChange={this.onInputChanged}
              placeholder="An optional message to the recipient.  Should not include the security answer"
            />
            <ButtonPrimary onClick={this.onSubmit}><FormattedMessage {...button} /></ButtonPrimary>
          </Form>
          <ModalOperation
            cancelCallback={this.onCancelTransfer}
            isOpen={transferInProgress}
            header={transferOutHeader}
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
