import * as React from 'react';
import { defineMessages } from 'react-intl';
import { BuildVerifiedXfer } from '@thecointech/utilities/VerifiedTransfer';
import { GetStatusApi, GetDirectTransferApi } from '@thecointech/apis/broker';
import { weBuyAt } from '@thecointech/fx-rates';
import { useState } from 'react';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { useFxRates } from '@thecointech/shared/containers/FxRate';
import { TransferWidget } from './TransferWidget';
import { log } from '@thecointech/logging';
import { MessageWithValues } from '@thecointech/shared/types';

const translations = defineMessages({
  errorMessage : {
      defaultMessage: 'We have encountered an error. Don\'t worry, your money is safe, but please still contact support@thecoin.io',
      description: 'app.accounts.transfer.errorMessage: Error Message for the make a payment page / etransfer tab'},
  successMessage : {
      defaultMessage: 'Order received.\nYou should receive the transfer in 1-2 business days.',
      description: 'app.accounts.transfer.successMessage: Success Message for the make a payment page / etransfer tab'},
  description : {
      defaultMessage: 'Transfer directly to another account with TheCoin.',
      description: 'app.accounts.transfer.description: Description for the make a payment page / transfer tab'},
  transferOutHeader : {
      defaultMessage: 'Processing Transfer...',
      description: 'app.accounts.transfer.transferOutHeader: transferHeader for the make a payment page / transfer tab'},
  step1 : {
      defaultMessage: 'Step 1 of 3: Checking transfer availability...',
      description: 'app.accounts.transfer.step1: Message for step1 for the make a payment page / transfer tab'},
  step2 : {
      defaultMessage: 'Step 2 of 3: Sending transfer command to our servers...',
      description: 'app.accounts.transfer.step2: Message for step2 for the make a payment page / transfer tab'},
  step3 : {
      defaultMessage: 'Step 3 of 3: Waiting for the transfer to be accepted\n(check progress {link})...',
      description: 'app.accounts.transfer.step3: Message for step3 for the make a payment page / transfer tab'},
  transferOutProgress : {
      defaultMessage: 'Please wait, we are sending your order to our servers...',
      description: 'app.accounts.transfer.transferOutProgress: transferOutProgress for the make a payment page / transfer tab'},
  destinationAddress : {
      defaultMessage: 'Destination Address',
      description: 'app.accounts.transfer.destinationAddress: destinationAddress for the make a payment page / transfer tab'},
  button : {
      defaultMessage: 'Transfer',
      description: 'app.accounts.transfer.form.button: Label for the form the make a payment page / transfer tab'}
});

export const Transfer = () => {

  const [coinTransfer, setCoinTransfer] = useState(null as number | null);
  const [toAddress, setToAddress] = useState<MaybeString>();

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
    setCoinTransfer(null);
    setResetDefault(Date.now());
    setForceValidate(false);
  }

  const doTransfer = async () => {
    if (!toAddress || !coinTransfer) {
      log.info("Cannot transfer: missing required field");
      return;
    }
    // Init messages
    setTransferMessage(translations.step1);
    setPercentComplete(0.0);

    // First, get the brokers fee
    const statusApi = GetStatusApi();
    var { data } = await statusApi.status();
    // Check out if we have the right values
    if (!data.certifiedFee) {
      setErrorHidden(false)
      return false;
    }
    if (doCancel) return false;

    // Get our variables
    const { signer, contract } = account!;
    if (!signer || !contract) return false;

    // To transfer, we construct & sign a message that
    // that allows the broker to transfer TheCoin to another address
    const transferCommand = await BuildVerifiedXfer(
      signer,
      toAddress,
      coinTransfer,
      data.certifiedFee,
    );
    const transferApi = GetDirectTransferApi();

    if (doCancel) return false;

    // Send the command to the server
    setTransferMessage(translations.step2);
    setPercentComplete(0.25);
    const response = await transferApi.transfer(transferCommand);
    if (!response.data?.hash) {
      log.error(`Error: missing response data: ${JSON.stringify(response)}`);
      setErrorHidden(false);
      return false;
    }

    // Wait on the given hash
    setTransferMessage({
      ...translations.step3,
      values: {
        link: (
          <a target="_blank" href={`https://${process.env.POLYGONSCAN_WEB_URL}/tx/${response.data.hash}`}> here </a>),
      }
    });
    setPercentComplete(0.5);

    // const tx = await contract.provider.getTransaction(response.data.hash);
    const tx = await contract.runner?.provider?.getTransaction(response.data.hash);
    const r = await tx?.wait(2, 3 * 1000); 
    setPercentComplete(1);
    return r?.status == 1;
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
      const result = await doTransfer();
      if (result) {
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

  return (
    <TransferWidget
      errorMessage={translations.errorMessage}
      errorHidden={errorHidden}
      successMessage={translations.successMessage}
      successHidden={successHidden}

      description={translations.description}
      onValueChange={setCoinTransfer}
      account={account!}
      coinTransfer={coinTransfer}
      rate={rate}

      onAccountValue={setToAddress}
      forceValidate={forceValidate}
      resetToDefault={resetToDefault}
      onSubmit={onSubmit}
      button={translations.button}
      destinationAddress={translations.destinationAddress}

      onCancelTransfer={() => setDoCancel(true)}
      transferInProgress={transferInProgress}
      transferOutHeader={translations.transferOutHeader}
      transferMessage={transferMessage}
      percentComplete={percentComplete}
      />
  );
}
