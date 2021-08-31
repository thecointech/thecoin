import * as React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { BuildVerifiedSale } from '@thecointech/utilities/VerifiedSale';
import { weBuyAt } from '@thecointech/fx-rates';
import { GetStatusApi, GetETransferApi } from 'api'
import { ETransferPacket } from '@thecointech/types';
import { useState } from 'react';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { useFxRates } from '@thecointech/shared/containers/FxRate';
import { RedeemWidget } from './RedeemWidget';
import type { MessageWithValues } from '@thecointech/shared/types';

const translations = defineMessages({
  errorMessage : {
      defaultMessage: 'We have encountered an error. Don\'t worry, your money is safe, but please still contact support@thecoin.io',
      description: 'app.accounts.redeem.errorMessage: Error Message for the make a payment page / etransfer tab'},
  successMessage : {
      defaultMessage: 'Order received.\nYou should receive the e-Transfer in 1-2 business days.',
      description: 'app.accounts.redeem.successMessage: Success Message for the make a payment page / etransfer tab'},
  description : {
      defaultMessage: 'Email money to anyone with an interac e-Transfer.',
      description: 'app.accounts.redeem.description: Description for the make a payment page / etransfert tab'},
  emailLabel : {
      defaultMessage: 'Recipient email',
      description: 'app.accounts.redeem.form.emailLabel: Label for the form the make a payment page / etransfert tab'},
  emailDesc : {
      defaultMessage: 'An email address to send the e-Transfer to',
      description: 'app.accounts.redeem.form.emailDesc: Label for the form the make a payment page / etransfert tab'},
  questionLabel : {
      defaultMessage: 'Security question',
      description: 'app.accounts.redeem.form.questionLabel: Label for the form the make a payment page / etransfert tab'},
  answerLabel : {
      defaultMessage: 'Security answer',
      description: 'app.accounts.redeem.form.answerLabel: Label for the form the make a payment page / etransfert tab'},
  messageLabel : {
      defaultMessage: 'Message (optional)',
      description: 'app.accounts.redeem.form.messageLabel: Label for the form the make a payment page / etransfert tab'},
  messageDesc : {
      defaultMessage: 'An optional message to the recipient. Should not include the security answer',
      description: 'app.accounts.redeem.form.messageDesc: Label for the form the make a payment page / etransfert tab'},
  noSpecialCaractDesc : {
      defaultMessage: 'No numbers or special characters',
      description: 'app.accounts.redeem.form.noSpecialCaractDesc: Label for the form the make a payment page / etransfert tab'},
  step1 : {
      defaultMessage: 'Step 1 of 3: Checking order availability...',
      description: 'app.accounts.redeem.step1: Message for the form the make a payment page / etransfert tab'},
  step2 : {
      defaultMessage: 'Step 2 of 3: Sending sell order to our servers...',
      description: 'app.accounts.redeem.step2: Message for the form the make a payment page / etransfert tab'},
  step3 : {
      defaultMessage: 'Step 3 of 3: Waiting for the order to be accepted\n(check progress {link})...',
      description: 'app.accounts.redeem.step3: Message for the form the make a payment page / etransfert tab'},
  transferOutHeader : {
      defaultMessage: 'Processing Transfer out...',
      description: 'app.accounts.redeem.transferOutHeader: Message for the form the make a payment page / etransfert tab'},
  transferOutProgress : {
      defaultMessage: 'Please wait, we are sending your order to our servers...',
      description: 'app.accounts.redeem.transferOutProgress: Message for the form the make a payment page / etransfert tab'},
  button : {
      defaultMessage: 'Send e-Transfer',
      description: 'app.accounts.redeem.form.button: For the button in the make a payment page / etransfer tab'}
});

export const Redeem = () => {

  const [coinToSell, setCoinToSell] = useState(null as number | null);
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState<MaybeString>();

  const [validationMessage] = useState<MessageWithValues|null>(null);
  const [forceValidate, setForceValidate] = useState(false);

  const [transferInProgress, setTransferInProgress] = useState(false);
  const [transferMessage, setTransferMessage] = useState<MessageWithValues>(translations.transferOutProgress);
  const [percentComplete, setPercentComplete] = useState(0);
  const [doCancel, setDoCancel] = useState(false);

  const [successHidden, setSuccessHidden] = useState(true);
  const [errorHidden, setErrorHidden] = useState(true);

  const account = AccountMap.useActive();
  const { rates } = useFxRates();
  const rate = weBuyAt(rates);

  const intl = useIntl();

  const isValid = !validationMessage;
  //const canSubmit = isValid && coinToSell;

  const doSale = async () => {
    // Init messages
    setForceValidate(true);
    setTransferMessage(translations.step1);
    setPercentComplete(0.0);

    // First, get the brokers fee
    const statusApi = GetStatusApi();
    var {data} = await statusApi.status();
    // Check out if we have the right values
    if (!data.certifiedFee) return false;

    if (doCancel) return false;

    // Get our variables
    const { signer, contract } = account!;
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
    setTransferMessage(translations.step2);
    setPercentComplete(0.25);
    const response = await eTransferApi.eTransfer(command);

    if (!response.data?.hash) {
      console.log(`Error: ${JSON.stringify(response)}`);
      return false;
    }

    // Wait on the given hash
    setTransferMessage({
      ...translations.step3,
      values: {
        link: (
          <a target="_blank" href={`https://ropsten.etherscan.io/tx/${response.data.hash}`}> here </a>),
      }
    });
    setPercentComplete(0.5);

    const tx = await contract.provider.getTransaction(response.data.hash);
    // Wait at least 2 confirmations
    tx.wait(2);
    setPercentComplete(1);
    return true;
  }

  const onSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    if (e) e.preventDefault();
    setDoCancel(false);
    setTransferInProgress(true);

    try {
      const results = await doSale();
      if (!results) {
        setSuccessHidden(true);
        setErrorHidden(false);
      } else
        setSuccessHidden(false);
        setErrorHidden(true);
    } catch (e) {
      console.error(e);
      alert(e);
    }
    setDoCancel(false);
    setTransferInProgress(false);
  }

  const onValueChange = (value: number) => {
    setCoinToSell(value);
  }

  const onCancelTransfer = () => {
    setDoCancel(true);
  }

  return (
      <RedeemWidget
        errorMessage={translations.errorMessage}
        errorHidden={errorHidden}
        successMessage={translations.successMessage}
        successHidden={successHidden}

        coinToSell={coinToSell}
        description={translations.description}
        onValueChange={onValueChange}
        account={account}
        rate={rate}

        emailLabel={translations.emailLabel}
        setEmail={(value: string) => setEmail(value)}
        emailDes={intl.formatMessage(translations.emailDesc)}

        questionLabel={translations.questionLabel}
        setQuestion={(value: string) => setQuestion(value)}
        noSpecialCaractDesc={intl.formatMessage(translations.noSpecialCaractDesc)}

        answerLabel={translations.answerLabel}
        setAnswer={(value: string) => setAnswer(value)}
        messageLabel={translations.messageLabel}
        setMessage={(value: string) => setMessage(value)}
        messageDesc={intl.formatMessage(translations.messageDesc)}

        button={translations.button}
        onSubmit={onSubmit}

        cancelCallback={onCancelTransfer}
        transferInProgress={transferInProgress}
        transferOutHeader={translations.transferOutHeader}
        transferMessage={transferMessage}
        percentComplete={percentComplete}

        isValid={isValid}
        forceValidate={forceValidate}
        validationMessage={undefined}
      />
  );
}
