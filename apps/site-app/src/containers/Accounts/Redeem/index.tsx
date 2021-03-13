import * as React from 'react';
import { connect } from 'react-redux';
import { Form, Grid, Header } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { BuildVerifiedSale } from '@the-coin/utilities/VerifiedSale';
import { DualFxInput } from '@the-coin/shared/components/DualFxInput';
import { FxRatesState } from '@the-coin/shared/containers/FxRate/types';
import { weBuyAt } from '@the-coin/shared/containers/FxRate/reducer';
import { selectFxRate } from '@the-coin/shared/containers/FxRate/selectors';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import { AccountState } from '@the-coin/shared/containers/Account/types';
import { GetStatusApi, GetETransferApi } from 'api'
import { ETransferPacket } from '@the-coin/types';
import { ButtonTertiary } from '@the-coin/site-base/components/Buttons';
import interact from './images/icon_payment_big.svg';
import { useState } from 'react';

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
const emailLabel = { id:"app.accounts.redeem.form.email",
                defaultMessage:"Recipient email",
                description:"Label for the form the make a payment page / etransfert tab" };
const emailDesc = { id:"app.accounts.redeem.form.emailDesc",
                defaultMessage:"An email address to send the e-Transfer to",
                description:"Label for the form the make a payment page / etransfert tab" };
const questionLabel = { id:"app.accounts.redeem.form.question",
                defaultMessage:"Security question",
                description:"Label for the form the make a payment page / etransfert tab" };
const answerLabel = { id:"app.accounts.redeem.form.answer",
                defaultMessage:"Security answer",
                description:"Label for the form the make a payment page / etransfert tab" };
const messageLabel = { id:"app.accounts.redeem.form.message",
                defaultMessage:"Message (optional)",
                description:"Label for the form the make a payment page / etransfert tab" };
const messageDesc = { id:"app.accounts.redeem.form.messageDesc",
                defaultMessage:"An optional message to the recipient. Should not include the security answer",
                description:"Label for the form the make a payment page / etransfert tab" };

const noSpecialCaractDesc = { id:"app.accounts.redeem.form.noSpecialCaractDesc",
                defaultMessage:"No numbers or special characters ",
                description:"Label for the form the make a payment page / etransfert tab" };
                               
//const step1= { id:"app.accounts.redeem.step1",
//                defaultMessage:"Step 1 of 3: Checking order availability..." };
const step2= { id:"app.accounts.redeem.step2",
                defaultMessage:"Step 2 of 3: Sending sell order to our servers..." };
const step3= { id:"app.accounts.redeem.step3",
                defaultMessage:"Step 3 of 3: Waiting for the order to be accepted\n(check progress {link})..." };

const transferOutHeader= { id:"app.accounts.redeem.transferOutHeader",
                defaultMessage:"Processing Transfer out..." };
const transferOutProgress= { id:"app.accounts.redeem.transferOutHeader",
                defaultMessage:"Please wait, we are sending your order to our servers..." };

const button = { id:"app.accounts.redeem.form.button",
                defaultMessage:"Send e-Transfert",
                description:"For the button in the make a payment page / etransfert tab" };


export const RedeemHook = (props: Props) => {

  const [coinToSell, setCoinToSell] = useState(null as number | null);
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState(undefined as string | undefined);

  const [transferInProgress, setTransferInProgress] = useState(false);
  const [transferMessage, setTransferMessage] = useState(transferOutProgress);
  const [transferValues, setTransferValues] = useState(undefined as any);
  const [percentComplete, setPercentComplete] = useState(0);
  const [doCancel, setDoCancel] = useState(false);

  const intl = useIntl();

  async function doSale() {
    // Init messages
    setPercentComplete(0.0);

    // First, get the brokers fee
    const statusApi = GetStatusApi();
    var {data} = await statusApi.status();
    // Check out if we have the right values
    if (!data.certifiedFee) return false;

    if (doCancel) return false;

    // Get our variables
    const { signer, contract } = props.account;
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

    if (doCancel)
      return false;

    // Send the command to the server
    setTransferMessage(step2);
    setPercentComplete(0.25);
    const response = await eTransferApi.eTransfer(command);

    if (!response.data?.txHash) {
      console.log(`Error: ${JSON.stringify(response)}`);
      return false;
    }

    // Wait on the given hash
    const transferValues = {
      link: (
        <a target="_blank" href={`https://ropsten.etherscan.io/tx/${response.data.txHash}`}> here </a>),
    };
    setTransferMessage(step3);
    setPercentComplete(0.5);
    setTransferValues(transferValues);

    const tx = await contract.provider.getTransaction(response.data.txHash);
    // Wait at least 2 confirmations
    tx.wait(2);
    const receipt = await contract.provider.getTransactionReceipt(
      response.data.txHash,
    );
    console.log(
      `Transfer mined in ${receipt.blockNumber} - ${receipt.blockHash}`,
    );
    setPercentComplete(1);
    return true;
  }

  async function onSubmit(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();
    setDoCancel(false);
    setTransferValues(undefined);
    setTransferInProgress(true);

    try {
      const results = await doSale();
      if (!results) {
        alert(<FormattedMessage {...errorMessage} />);
      } else
        alert(<FormattedMessage {...successMessage} />);
    } catch (e) {
      console.error(e);
      alert(e);
    }
    setDoCancel(false);
    setTransferInProgress(false);
  }

  function onValueChange(value: number) {
    setCoinToSell(value);
  }

  function onCancelTransfer(){
    setDoCancel(true);
  }

  const { account, rates } = props;
  const rate = weBuyAt(rates);
  return (
    <React.Fragment>
      <Form>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              <Header as="h5">
                <Header.Subheader>
                  <FormattedMessage {...description} />
                </Header.Subheader>
              </Header>
            </Grid.Column>
            <Grid.Column floated='right' width={4}>
              <img src={interact} />
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <DualFxInput
          onChange={onValueChange}
          asCoin={true}
          maxValue={account.balance}
          value={coinToSell}
          fxRate={rate}
        />
        <Form.Input
          className={"borderTop borderBottom"}
          label={<FormattedMessage {...emailLabel} />}
          name="email"
          onChange={event => setEmail(event.target.value)}
          placeholder={intl.formatMessage(emailDesc)}
        />
        <Form.Input
          className={"half left"}
          label={<FormattedMessage {...questionLabel} />}
          name="question"
          onChange={event => setQuestion(event.target.value)}
          placeholder={intl.formatMessage(noSpecialCaractDesc)}
        />
        <Form.Input
          className={"half right"}
          label={<FormattedMessage {...answerLabel} />}
          name="answer"
          onChange={event => setAnswer(event.target.value)}
          placeholder={intl.formatMessage(noSpecialCaractDesc)}
        />
        <Form.Input
          className={"borderTop"}
          label={<FormattedMessage {...messageLabel} />}
          name="message"
          type="text"
          onChange={event => setMessage(event.target.value)}
          placeholder={intl.formatMessage(messageDesc)}
        />
        <ButtonTertiary className={"x4spaceBefore x2spaceAfter"} onClick={onSubmit}><FormattedMessage {...button} /></ButtonTertiary>
      </Form>
      <ModalOperation
        cancelCallback={onCancelTransfer}
        isOpen={transferInProgress}
        header={transferOutHeader}
        progressMessage={transferMessage}
        progressPercent={percentComplete}
        messageValues={transferValues}
      />
    </React.Fragment>
  );
}

export const Redeem = connect(selectFxRate)(RedeemHook);
