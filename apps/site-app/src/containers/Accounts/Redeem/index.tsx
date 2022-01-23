import * as React from 'react';
import { defineMessages } from 'react-intl';
import { BuildVerifiedSale, isPacketValid } from '@thecointech/utilities/VerifiedSale';
import { weBuyAt } from '@thecointech/fx-rates';
import { GetStatusApi, GetETransferApi } from 'api'
import { ETransferPacket } from '@thecointech/types';
import { useState } from 'react';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { useFxRates } from '@thecointech/shared/containers/FxRate';
import { RedeemWidget } from './RedeemWidget';
import type { MessageWithValues } from '@thecointech/shared/types';
import { log } from '@thecointech/logging';

const translations = defineMessages({
  step1: {
    defaultMessage: 'Step 1 of 3: Checking order availability...',
    description: 'app.accounts.redeem.step1: Message for the form the make a payment page / etransfert tab'
  },
  step2: {
    defaultMessage: 'Step 2 of 3: Sending sell order to our servers...',
    description: 'app.accounts.redeem.step2: Message for the form the make a payment page / etransfert tab'
  },
  step3: {
    defaultMessage: 'Step 3 of 3: Waiting for the order to be accepted\n(check progress {link})...',
    description: 'app.accounts.redeem.step3: Message for the form the make a payment page / etransfert tab'
  },
  transferOutProgress: {
    defaultMessage: 'Please wait, we are sending your order to our servers...',
    description: 'app.accounts.redeem.transferOutProgress: Message for the form the make a payment page / etransfert tab'
  },
})
export const Redeem = () => {

  const [coinToSell, setCoinToSell] = useState(null as number | null);
  const [email, setEmail] = useState<MaybeString>();
  const [question, setQuestion] = useState<MaybeString>();
  const [answer, setAnswer] = useState<MaybeString>();
  const [message, setMessage] = useState<MaybeString>();

  const [forceValidate, setForceValidate] = useState(false);
  const [resetToDefault, setResetDefault] = useState(Date.now());

  const [transferInProgress, setTransferInProgress] = useState(false);
  const [transferMessage, setTransferMessage] = useState<MessageWithValues>(translations.transferOutProgress);
  const [percentComplete, setPercentComplete] = useState(0);
  const [doCancel, setDoCancel] = useState(false);

  const [successHidden, setSuccessHidden] = useState(true);
  const [errorHidden, setErrorHidden] = useState(true);

  const account = AccountMap.useActive();
  const { rates } = useFxRates();
  const rate = weBuyAt(rates);

  const resetForm = () => {
    setCoinToSell(null);
    setResetDefault(Date.now());
    setForceValidate(false);
  }

  const doSale = async () => {
    if (!email || !question || !answer || !coinToSell) {
      log.info("Cannot submit: missing one of the required fields");
      return false;
    }

    // To redeem, we construct & sign a message that
    // that allows the broker to transfer TheCoin to itself
    const eTransfer: ETransferPacket = {
      email, question, answer, message
    }
    if (!isPacketValid(eTransfer)) {
      // This should never hit, the pre-validation
      // should catch all errors.  However, this runs
      // through the same validation code that runs
      // on the server, so it's theoretically possible it could pick
      // something the individual validators don't
      log.error("Packate validation failed!");
      setErrorHidden(false)
      return false;
    }

    log.trace("Commencing eTransfer");
    setTransferMessage(translations.step1);
    setPercentComplete(0.0);

    // First, get the brokers fee
    const statusApi = GetStatusApi();
    var { data } = await statusApi.status();
    // Check out if we have the right values
    if (!data.certifiedFee) {
      setErrorHidden(false);
      return false;
    }

    if (doCancel) return false;

    // Get our variables
    const { signer, contract } = account!;
    if (!signer || !contract)
      return false;

    const command = await BuildVerifiedSale(
      eTransfer,
      signer,
      data.address,
      coinToSell,
      data.certifiedFee,
    );
    log.trace("Built Packet");

    const eTransferApi = GetETransferApi();
    if (doCancel)
      return false;

    // Send the command to the server
    setTransferMessage(translations.step2);
    setPercentComplete(0.25);
    const response = await eTransferApi.eTransfer(command);
    if (!response.data?.hash) {
      log.error(`Error: missing response data: ${JSON.stringify(response)}`);
      setErrorHidden(false);
      return false;
    }
    log.trace({hash: response.data?.hash}, "Sent to servers, hash: {hash}");

    // Wait on the given hash
    setTransferMessage({
      ...translations.step3,
      values: {
        link: (
          <a target="_blank" href={`https://${process.env.DEPLOY_NETWORK}.etherscan.io/tx/${response.data.hash}`}> here </a>),
      }
    });
    setPercentComplete(0.5);

    const tx = await contract.provider.getTransaction(response.data.hash);
    if (tx) {
      // Wait at least 2 confirmations
      await tx.wait(2);
    }
    else {
      // tx registered, but may not be visible on the blockchain.  Show link anyway
      await sleep(2500);
    }

    setPercentComplete(1);
    return true;
  }

  const onSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    if (e) e.preventDefault();
    setDoCancel(false);
    setTransferInProgress(true);
    // Init messages
    setForceValidate(true);
    setErrorHidden(true);
    setSuccessHidden(true);

    try {
      const results = await doSale();
      if (results) {
        setSuccessHidden(false);
        resetForm();
      }
    } catch (e: any) {
      log.error(`Exception on Submit eTransfer: ${e.message}`);
      setErrorHidden(false);
    }
    setDoCancel(false);
    setTransferInProgress(false);
  }

  const onCancelTransfer = () => {
    setDoCancel(true);
  }

  return (
    <RedeemWidget
      errorHidden={errorHidden}
      successHidden={successHidden}

      coinToSell={coinToSell}
      onValueChange={setCoinToSell}
      account={account}
      rate={rate}

      setEmail={setEmail}
      setQuestion={setQuestion}
      setAnswer={setAnswer}
      setMessage={setMessage}
      resetToDefault={resetToDefault}

      onSubmit={onSubmit}

      cancelCallback={onCancelTransfer}
      transferInProgress={transferInProgress}
      percentComplete={percentComplete}

      forceValidate={forceValidate}
      transferMessage={transferMessage}
    />
  );
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
