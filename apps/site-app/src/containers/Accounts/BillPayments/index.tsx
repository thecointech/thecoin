import React, { useState } from 'react';
import { Form, Dropdown, Message } from 'semantic-ui-react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { BuildVerifiedBillPayment } from '@thecointech/utilities/VerifiedBillPayment';
import { BuildUberAction } from '@thecointech/utilities/UberAction';
import { DualFxInput } from '@thecointech/shared/components/DualFxInput';
import { weBuyAt } from '@thecointech/fx-rates';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { payees, validate } from './payees';
import { BillPayeePacket } from '@thecointech/types';
import { GetStatusApi, GetBillPaymentsApi } from '@thecointech/apis/broker';
import { UxInput } from '@thecointech/shared/components/UX/Input';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import { FilterPayee } from './FilterPayee';
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import type { MessageWithValues } from '@thecointech/shared/types';
import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';

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
  const [payee, setPayee] = useState<MaybeString>();
  const [accountNumber, setAccountNumber] = useState<MaybeString>();

  const [forceValidate, setForceValidate] = useState(false);
  const [resetToDefault, setResetDefault] = useState(Date.now());

  const [transferInProgress, setTransferInProgress] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<MessageWithValues>(translations.transferOutProgress);
  const [percentComplete, setPercentComplete] = useState(0);
  const [doCancel, setDoCancel] = useState(false);

  const [successHidden, setSuccessHidden] = useState(true);
  const [errorHidden, setErrorHidden] = useState(true);

  const asCoin = !account?.plugins?.length;
  if (!asCoin) {
    log.warn("WARNING: Submitting UberTransfer is experimental")
  }
  const resetForm = () => {
    setCoinToSell(null);
    setResetDefault(Date.now());
    setForceValidate(false);
  }

  function onCancelTransfer() {
    setDoCancel(true);
  }

  async function doBillPayment() {

    // Get our variables
    if (!coinToSell || !payee || !accountNumber) {
      log.info("Cannot submit: missing one of the required fields");
      return false;
    }
    // Init messages
    setPaymentMessage(translations.step1);
    setPercentComplete(0.0);

    // First, get the brokers fee
    const statusApi = GetStatusApi();
    var { data } = await statusApi.status();
    // Check out if we have the right values
    // if (!data?.certifiedFee) {
    //   setErrorHidden(false);
    //   return false;
    // }

    if (doCancel)
      return false;

    // Get our variables
    const { signer, contract } = account!;
    if (!signer || !contract)
      return false;

    const packet: BillPayeePacket = {
      accountNumber,
      payee,
    };

    const billPayApi = GetBillPaymentsApi();
    const doUberBillPayment = async () => {
      // TESTING ONLY: Can we pay 3 mins in the future?
      const billPayCommand = await BuildUberAction(
        packet,
        signer,
        data.address,
        new Decimal(coinToSell),
        124,
        DateTime.now().plus({ minutes: 3 }),
      )
      setPaymentMessage(translations.step2);
      setPercentComplete(0.25);
      return await billPayApi.uberBillPayment(billPayCommand);
    }
    const doVerfiedBillPayment = async () => {
      // Immediate transfer, cheaper than the uber bill payment
      const billPayCommand = await BuildVerifiedBillPayment(
        packet,
        signer,
        data.address,
        coinToSell,
        data.certifiedFee,
      )
      setPaymentMessage(translations.step2);
      setPercentComplete(0.25);
      return await billPayApi.billPayment(billPayCommand);
    }
    // Send the command to the server
    const response = await (asCoin ? doVerfiedBillPayment() : doUberBillPayment());
    const hash = response.data?.hash
    if (!hash) {
      log.error(`Error: missing response data: ${JSON.stringify(response)}`);
      setErrorHidden(false);
      return false;
    }

    // Wait on the given hash
    setPaymentMessage({
      ...translations.step3,
      values: {
        link: (
          <a target="_blank" href={`https://${process.env.POLYGONSCAN_WEB_URL}/tx/${hash}`}>here</a>
        ),
      }
    });
    setPercentComplete(0.5);
    const tx = await contract.runner?.provider?.getTransaction(hash);
    // Wait at least 2 confirmations
    const r = await tx?.wait(2, 3 * 1000);
    setPercentComplete(1);
    return r?.status == 1;
  }


  async function onSubmit(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    setDoCancel(false);
    setTransferInProgress(true);
    // Init messages
    setForceValidate(true);
    setErrorHidden(true);
    setSuccessHidden(true);

    try {
      const results = await doBillPayment();
      if (results) {
        setSuccessHidden(false);
        resetForm();
      }
    } catch (e: any) {
      log.error(`Exception on submit Bill: ${e.message}`);
      setErrorHidden(false);
    }
    setDoCancel(false);
    setTransferInProgress(false);
  }
  const uxProps = {
    resetToDefault: resetToDefault,
    forceValidate: forceValidate,
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
          options={payees}
          onChange={(_, data) => setPayee(data.value as string)}
        />
        <UxInput
          intlLabel={translations.accountNumer}
          onValue={setAccountNumber}
          onValidate={value => validate(payee, value)}
          placeholder={translations.payeeAccount}
          tooltip={translations.payeeAccount}
          {...uxProps}
        />
        {/*<Form.Input label="Bill Name" onChange={onNameChange} placeholder="An optional name to remember this payee by" /> */}
        <DualFxInput
          onChange={setCoinToSell}
          asCoin={asCoin}
          maxValue={account!.balance}
          value={coinToSell}
          fxRate={rate}
          {...uxProps}
        />
        <ButtonTertiary onClick={onSubmit}>
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
