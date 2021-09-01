import React, { useCallback, useState } from 'react';
import { Form, Dropdown, DropdownProps, Message } from 'semantic-ui-react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { BuildVerifiedBillPayment } from '@thecointech/utilities/VerifiedBillPayment';
import { DualFxInput } from '@thecointech/shared/components/DualFxInput';
import { weBuyAt } from '@thecointech/fx-rates';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { payees, validate } from './payees';
import { BillPayeePacket } from '@thecointech/types';
import { GetStatusApi, GetBillPaymentsApi } from 'api';
import { UxInput } from '@thecointech/shared/components/UxInput';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import { FilterPayee } from './FilterPayee';
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import type { MessageWithValues } from '@thecointech/shared/types';

const translations = defineMessages({
  description: {
    defaultMessage: 'You can pay your bills directly from The Coin. Select payee:',
    description: 'app.accounts.billPayments.description: Description for the make a payment page / bill payment tab'
  },
  payeeTxt: {
    defaultMessage: 'Select Payee',
    description: 'app.accounts.billPayments.payeeTxt: Label for the form the make a payment page / bill payment tab'
  },
  accountNumer: {
    defaultMessage: 'Payee Account Number',
    description: 'app.accounts.billPayments.form.accNumber: Label for the form the make a payment page / bill payment tab'
  },
  button: {
    defaultMessage: 'Send payment',
    description: 'app.accounts.billPayments.form.button: Label for the form the make a payment page / bill payment tab'
  },
  errorForm: {
    defaultMessage: 'We have encountered an error. Don\'t worry, your money is safe, but please contact support@thecoin.io and describe what happened',
    description: 'app.accounts.billPayments.form.errorForm: Message for the form the make a payment page / bill payment tab'
  },
  successForm: {
    defaultMessage: 'Order received. Your bill payment will be processed in the next 1-2 business days. Please note that bill payments can take several days to settle,\nso paying a few days early ensures that payments are recieved on time',
    description: 'app.accounts.billPayments.form.successForm: Message for the form the make a payment page / bill payment tab'
  },
  transferOutHeader: {
    defaultMessage: 'Processing Bill Payment...',
    description: 'app.accounts.billPayments.transferOutHeader: Message for the form the make a payment page / bill payment tab'
  },
  step1: {
    defaultMessage: 'Step 1 of 3: Checking payment availability...',
    description: 'app.accounts.billPayments.step1: Message for the form the make a payment page / bill payment tab'
  },
  step2: {
    defaultMessage: 'Step 2 of 3: Sending bill payment to our servers...',
    description: 'app.accounts.billPayments.step2: Message for the form the make a payment page / bill payment tab'
  },
  step3: {
    defaultMessage: 'Step 3 of 3: Waiting for the bill payment to be accepted (check progress {link})...',
    description: 'app.accounts.billPayments.step3: Message for the form the make a payment page / bill payment tab'
  },
  transferOutProgress: {
    defaultMessage: 'Please wait, we are sending your order to our servers...',
    description: 'app.accounts.billPayments.transferOutProgress: Message for the form the make a payment page / bill payment tab'
  },
  payeeAccount: {
    defaultMessage: 'Payee account number',
    description: 'app.accounts.billPayments.form.payeeAccount: Label for the form the make a payment page / bill payment tab'
  }
});

export const BillPayments = () => {
  const intl = useIntl();
  const account = AccountMap.useActive();
  const { rates } = FxRateReducer.useData();
  const rate = weBuyAt(rates);

  const [coinToSell, setCoinToSell] = useState(null as number | null);
  const [payee, setPayee] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  //const [payeeName, setPayeeName] = useState("");

  const [validationMessage, setValidationMessage] = useState<MessageWithValues | undefined>(undefined);
  const [forceValidate, setForceValidate] = useState(false);

  const [transferInProgress, setTransferInProgress] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<MessageWithValues>(translations.transferOutProgress);
  const [percentComplete, setPercentComplete] = useState(0);
  const [doCancel, setDoCancel] = useState(false);

  const [successHidden, setSuccessHidden] = useState(true);
  const [errorHidden, setErrorHidden] = useState(true);

  const isValid = !validationMessage;
  const canSubmit = isValid && coinToSell;

  const resetState = useCallback(
    () => {
      setCoinToSell(null);
      setPayee("");
      setAccountNumber("");
      //setPayeeName("");
      setValidationMessage(undefined);
      setForceValidate(false);
      setTransferInProgress(false);
      setPaymentMessage(translations.transferOutProgress);
      setPercentComplete(0);
      setDoCancel(false);
    },
    [],
  );

  function onValueChange(value: number) {
    setCoinToSell(value);
  }

  function onCancelTransfer() {
    setDoCancel(true);
  }

  function onSubmit() {
    async (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      doSubmit();
    };
  }

  function onPayeeSelect(_: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) {
    setPayee((data.value as string) || '');
  }

  //function onNameChange (_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) {
  //   setPayeeName(data.value);
  //}

  function onAccountNumber(value: string) {
    const validation = validate(payee, value);
    setValidationMessage(validation);
    setAccountNumber(value);
  };

  async function doBillPayment() {
    // Init messages
    setPaymentMessage(translations.step1);
    setPercentComplete(0.0);

    // First, get the brokers fee
    const statusApi = GetStatusApi();
    var { data } = await statusApi.status();
    // Check out if we have the right values
    if (!data?.certifiedFee)
      return false;

    if (doCancel)
      return false;

    // Get our variables
    const { signer, contract } = account!;
    if (coinToSell === null || !signer || !contract || !payee) return false;

    const packet: BillPayeePacket = {
      accountNumber,
      payee,
    };
    // To redeem, we construct & sign a message that
    // that allows the broker to transfer TheCoin to itself
    const billPayCommand = await BuildVerifiedBillPayment(
      packet,
      signer,
      data.address,
      coinToSell,
      data.certifiedFee,
    );
    const billPayApi = GetBillPaymentsApi();
    if (doCancel) return false;

    // Send the command to the server
    setPaymentMessage(translations.step2);
    setPercentComplete(0.25);
    const response = await billPayApi.billPayment(billPayCommand);
    const txHash = response.data?.hash;
    if (!txHash) {
      alert(JSON.stringify(response));
      return false;
    }

    // Wait on the given hash
    setPaymentMessage({
      ...translations.step3,
      values: {
        link: (
          <a target="_blank" href={`https://ropsten.etherscan.io/tx/${txHash}`}>here</a>
        ),
      }
    });
    setPercentComplete(0.5);
    const tx = await contract.provider.getTransaction(txHash);
    // Wait at least 2 confirmations
    tx.wait(2);
    const receipt = await contract.provider.getTransactionReceipt(txHash);
    console.log(
      `Transfer mined in ${receipt.blockNumber} - ${receipt.blockHash}`,
    );
    setPercentComplete(1);
    return true;
  }

  async function doSubmit() {
    setDoCancel(false);
    setTransferInProgress(true);
    setForceValidate(true);

    // Validate inputs
    const isValid = !validationMessage;
    if (!coinToSell || !payee || !accountNumber || !isValid) return;

    try {
      const results = await doBillPayment();
      if (!results) {
        setErrorHidden(false);
        setSuccessHidden(true);
      } else
        setSuccessHidden(false);
      setErrorHidden(true);
      // Reset back to default state
      resetState();
    } catch (e) {
      console.error(e);
      alert(e);
    }
    resetState();
  }


  return (
    <React.Fragment>
      <Form>
        <FormattedMessage {...translations.description} />
        <Message hidden={successHidden} positive>
          <FormattedMessage {...translations.successForm} />
        </Message>
        <Message hidden={errorHidden} negative>
          <FormattedMessage {...translations.errorForm} />
        </Message>

        <FilterPayee />
        <Dropdown
          placeholder={intl.formatMessage(translations.payeeTxt)}
          fluid
          search
          selection
          allowAdditions
          options={payees}
          onChange={onPayeeSelect}
        />
        <UxInput
          intlLabel={translations.accountNumer}
          uxChange={onAccountNumber}
          isValid={isValid}
          forceValidate={forceValidate}
          message={validationMessage}
          placeholder={intl.formatMessage(translations.payeeAccount)}
        />
        {/*<Form.Input label="Bill Name" onChange={onNameChange} placeholder="An optional name to remember this payee by" /> */}
        <DualFxInput
          onChange={onValueChange}
          asCoin={true}
          maxValue={account!.balance}
          value={coinToSell}
          fxRate={rate}
        />
        <ButtonTertiary onClick={onSubmit} disabled={!canSubmit}>
          <FormattedMessage {...translations.button} />
        </ButtonTertiary>
      </Form>
      <ModalOperation
        cancelCallback={onCancelTransfer}
        isOpen={transferInProgress}
        header={translations.transferOutHeader}
        progressMessage={paymentMessage}
        progressPercent={percentComplete}
      />
    </React.Fragment>
  );
}
