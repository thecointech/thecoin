import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { BuildVerifiedSale } from '@the-coin/utilities/VerifiedSale';
import { weBuyAt } from '@the-coin/shared/containers/FxRate/reducer';
import { useFxRates } from '@the-coin/shared/containers/FxRate/selectors';
import { GetStatusApi, GetETransferApi } from 'api'
import { ETransferPacket } from '@the-coin/types';
import { useState } from 'react';
import { RedeemWidget } from './RedeemWidget';
import { useActiveAccount } from '@the-coin/shared/containers/AccountMap/selectors';


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

const button = { id:"app.accounts.redeem.form.button",
                defaultMessage:"Send e-Transfert",
                description:"For the button in the make a payment page / etransfert tab" };


export const Redeem = () => {

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

  const account = useActiveAccount();
  const { rates } = useFxRates();
  const rate = weBuyAt(rates);

  const intl = useIntl();

  const doSale = async () => { 
    // Init messages
    setTransferMessage(step1);
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

  const onSubmit = async (e: React.MouseEvent<HTMLElement>) => { 
    
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

  const onValueChange = (value: number) => { 
    setCoinToSell(value);
  }

  const onCancelTransfer = () => { 
    setDoCancel(true);
  }


  return (
      <RedeemWidget
        coinToSell={coinToSell}
        description={description}
        onValueChange={onValueChange}
        account={account}
        rate={rate}
    
        emailLabel={emailLabel}
        setEmail={event => setEmail(event.target.value)}
        emailDes={intl.formatMessage(emailDesc)}
    
        questionLabel={questionLabel}
        setQuestion={event => setQuestion(event.target.value)}
        noSpecialCaractDesc={intl.formatMessage(noSpecialCaractDesc)}
    
        answerLabel={answerLabel}
        setAnswer={event => setAnswer(event.target.value)}
    
        messageLabel={messageLabel}
        setMessage={event => setMessage(event.target.value)}
        messageDesc={intl.formatMessage(messageDesc)}
  
        button={button}
        onSubmit={onSubmit}
      
        cancelCallback={onCancelTransfer}
        transferInProgress={transferInProgress}
        transferOutHeader={transferOutHeader}
        transferMessage={transferMessage}
        percentComplete={percentComplete}
        transferValues={transferValues}
      />
  );
}