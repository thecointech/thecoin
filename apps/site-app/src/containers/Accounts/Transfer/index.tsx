import * as React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { NormalizeAddress } from '@thecointech/utilities';
import { BuildVerifiedXfer } from '@thecointech/utilities/VerifiedTransfer';
import { GetStatusApi, GetDirectTransferApi } from 'api';
import { weBuyAt } from '@thecointech/fx-rates';
import { useState } from 'react';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { useFxRates } from '@thecointech/shared/containers/FxRate';
import { TransferWidget } from './TransferWidget';

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
  const [toAddress, setToAddress] = useState('');
  const [forceValidate] = useState(false);

  const [transferInProgress, setTransferInProgress] = useState(false);
  const [transferMessage, setTransferMessage] = useState(translations.transferOutProgress);
  const [transferValues, setTransferValues] = useState(undefined as any);
  const [percentComplete, setPercentComplete] = useState(0);
  const [doCancel, setDoCancel] = useState(false);

  const [successHidden, setSuccessHidden] = useState(true);
  const [errorHidden, setErrorHidden] = useState(true);

  const account = useActiveAccount();
  const { rates } = useFxRates();
  const rate = weBuyAt(rates);
  const intl = useIntl();

  const doTransfer = async () => {
    // Init messages
    setTransferMessage(translations.step1);
    setPercentComplete(0.0);
    // First, get the brokers fee
    const statusApi = GetStatusApi(); //undefined, "http://localhost:8080"
    var status = await statusApi.status();
    // Check out if we have the right values
    if (!status.data.certifiedFee) return false;

    if (doCancel) return false;

    // Get our variables
    const { signer, contract } = account!;
    if (coinTransfer === null || !signer || !contract) return false;

    // To transfer, we construct & sign a message that
    // that allows the broker to transfer TheCoin to another address
    const transferCommand = await BuildVerifiedXfer(
      signer,
      NormalizeAddress(toAddress),
      coinTransfer,
      status.data.certifiedFee,
    );
    const transferApi = GetDirectTransferApi();

    if (doCancel) return false;

    // Send the command to the server
    setTransferMessage(translations.step2);
    setPercentComplete(0.25);
    const response = await transferApi.transfer(transferCommand);

    console.log(`TxResponse: ${response.data.message}`);
    if (!response.data.hash) {
      alert(response.data.message);
      return false;
    }

    // Wait on the given hash
    const transferValues = {
      link: (<a target="_blank" href={`https://ropsten.etherscan.io/tx/${response.data.hash}`}> here </a>),
    };
    setTransferMessage(translations.step3);
    setPercentComplete(0.5);
    setTransferValues(transferValues);

    const tx = await contract.provider.getTransaction(response.data.hash);
    // Wait at least 2 confirmations
    tx.wait(2);
    const receipt = await contract.provider.getTransactionReceipt(
      response.data.hash,
    );
    console.log(`Transfer mined in ${receipt.blockNumber} - ${receipt.blockHash}`,);
    setPercentComplete(1);
    return true;
  }

  const onSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    if (e) e.preventDefault();

    setDoCancel(false);
    setTransferValues(undefined);
    setTransferInProgress(true);

    try {
      const result = await doTransfer();
      if (!result) {
        setErrorHidden(false);
        setSuccessHidden(true);
      }
      else {
        setErrorHidden(true);
        setSuccessHidden(false);
      }
    } catch (err) {
      console.error(err);
      setErrorHidden(false);
      setSuccessHidden(true);
    }
    setPercentComplete(1);
    setTransferInProgress(false);
  }

  function onValueChange(value: number) {
    setCoinTransfer(value);
  }

  // Validate our inputs
  function onAccountValue(value: string) {
    setToAddress(value);
  }

  function onCancelTransfer() {
    setDoCancel(true);
  }
  return (
    <TransferWidget
      errorMessage={translations.errorMessage}
      errorHidden={errorHidden}
      successMessage={translations.successMessage}
      successHidden={successHidden}

      description={translations.description}
      onValueChange={onValueChange}
      account={account!}
      coinTransfer={coinTransfer}
      rate={rate}

      onAccountValue={onAccountValue}
      forceValidate={forceValidate}
      onSubmit={onSubmit}
      button={translations.button}
      destinationAddress={intl.formatMessage(translations.destinationAddress)}

      onCancelTransfer={onCancelTransfer}
      transferInProgress={transferInProgress}
      transferOutHeader={translations.transferOutHeader}
      transferMessage={transferMessage}
      percentComplete={percentComplete}
      transferValues={transferValues} />
  );
}
