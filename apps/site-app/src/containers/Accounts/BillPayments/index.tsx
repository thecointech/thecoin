import React, { useCallback, useState } from 'react';
import { Form, Header, Dropdown, DropdownProps} from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { BuildVerifiedBillPayment } from '@thecointech/utilities/VerifiedBillPayment';
import { DualFxInput } from '@thecointech/shared/components/DualFxInput';
import { weBuyAt } from '@thecointech/shared/containers/FxRate/reducer';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { payees, validate } from './payees';
import { BillPayeePacket } from '@thecointech/types';
import { GetStatusApi, GetBillPaymentsApi } from 'api';
import { UxInput } from '@thecointech/shared/components/UxInput';
import { ValuedMessageDesc } from '@thecointech/shared/components/UxInput/types';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';
import { FilterPayee } from './FilterPayee';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { useFxRates } from '@thecointech/shared/containers/FxRate';

const description = { id:"app.accounts.billPayments.description",
                defaultMessage:"You can pay your bills directly from The Coin. Select payee:",
                description:"Description for the make a payment page / bill payment tab" };
const payeeTxt = { id:"app.accounts.billPayments.form.payee",
                defaultMessage:"Select Payee",
                description:"Label for the form the make a payment page / bill payment tab" };
const accountNumer = { id:"app.accounts.billPayments.form.accNumber",
                defaultMessage:"Payee Account Number",
                description:"Label for the form the make a payment page / bill payment tab" };
const button = { id:"app.accounts.billPayments.form.button",
                defaultMessage:"Send payment",
                description:"Label for the form the make a payment page / bill payment tab" };

const transferOutHeader= { id:"app.accounts.billPayments.transferOutHeader",
                defaultMessage:"Processing Bill Payment..." };
const step1= { id:"app.accounts.billPayments.step1",
                defaultMessage:"Step 1 of 3: Checking payment availability..." };
const step2= { id:"app.accounts.billPayments.step2",
                defaultMessage:"Step 2 of 3: Sending bill payment to our servers..." };
const step3= { id:"app.accounts.billPayments.step3",
                defaultMessage:"Step 3 of 3: Waiting for the bill payment to be accepted (check progress {link})..." };
const transferOutProgress = { id:"app.accounts.billPayments.transferOutProgress",
                defaultMessage:"Please wait, we are sending your order to our servers..." };

const payeeAccount = { id:"app.accounts.billPayments.form.payeeAccount",
                defaultMessage:"Payee account number",
                description:"Label for the form the make a payment page / bill payment tab" };



export const BillPayments = () => {
  const intl = useIntl();
  const account = useActiveAccount();
  const { rates } = useFxRates();
  const rate = weBuyAt(rates);

  const [coinToSell, setCoinToSell] = useState(null as number | null);
  const [payee, setPayee] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  //const [payeeName, setPayeeName] = useState("");

  const [validationMessage, setValidationMessage] = useState(null as ValuedMessageDesc|null);
  const [forceValidate, setForceValidate] = useState(false);

  const [transferInProgress, setTransferInProgress] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(transferOutProgress);
  const [transferValues, setTransferValues] = useState(undefined as any);
  const [percentComplete, setPercentComplete] = useState(0);
  const [doCancel, setDoCancel] = useState(false);


  const resetState = useCallback(
    () => {
      setCoinToSell(null);
      setPayee("");
      setAccountNumber("");
      //setPayeeName("");
      setValidationMessage(null);
      setForceValidate(false);
      setTransferInProgress(false);
      setPaymentMessage(transferOutProgress);
      setTransferValues(undefined);
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

  function onPayeeSelect (_: React.SyntheticEvent<HTMLElement, Event>,data: DropdownProps) {
      setPayee((data.value as string) || '');
  }

  //function onNameChange (_: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) {
   //   setPayeeName(data.value);
  //}

  function onAccountNumber (value: string) {
      const validation = validate(payee, value);
      setValidationMessage(validation);
      setAccountNumber(value);
    };

    async function doBillPayment() {
      // Init messages
      setPaymentMessage(step1);
      setPercentComplete(0.0);

      // First, get the brokers fee
      const statusApi = GetStatusApi();
      var {data} = await statusApi.status();
      // Check out if we have the right values
      if (!data?.certifiedFee)
        return false;

      if (doCancel)
        return false;

      // Get our variables
      const account = useActiveAccount();
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
      setPaymentMessage(step2);
      setPercentComplete(0.25);
      const response = await billPayApi.billPayment(billPayCommand);
      const txHash = response.data?.txHash;
      if (!txHash) {
        alert(JSON.stringify(response));
        return false;
      }

      // Wait on the given hash
      const transferValues = {
        link: (
          <a
            target="_blank"
            href={`https://ropsten.etherscan.io/tx/${txHash}`}
          >
            here
          </a>
        ),
      };
      setPaymentMessage(step3);
      setPercentComplete(0.5);
      setTransferValues(transferValues);
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
      setTransferValues(undefined);
      setTransferInProgress(true);
      setForceValidate(true);

      // Validate inputs
      const isValid = !validationMessage;
      if (!coinToSell || !payee || !accountNumber || !isValid) return;

      try {
        const results = await doBillPayment();
        if (!results) {
          alert(
            "We have encountered an error.\nDon't worry, your money is safe, but please contact support@thecoin.io and describe whats happened",
          );
        } else
          alert(
            'Order recieved.\nYour bill payment will be processed in the next 1-2 business days.\nPlease note that bill payments can take several days to settle,\nso paying a few days early ensures that payments are recieved on time.',
          );

        // Reset back to default state
        resetState();
      } catch (e) {
        console.error(e);
        alert(e);
      }
      resetState();
    }


    const isValid = !validationMessage;
    const canSubmit = isValid && coinToSell;
    return (
    <React.Fragment>
        <Form>
            <Header as="h5">
                <Header.Subheader>
                <FormattedMessage {...description} />
                </Header.Subheader>
            </Header>
            <FilterPayee />
            <Dropdown
                placeholder={intl.formatMessage(payeeTxt)}
                fluid
                search
                selection
                allowAdditions
                options={payees}
                onChange={onPayeeSelect}
            />
            <UxInput
                intlLabel={accountNumer}
                uxChange={onAccountNumber}
                isValid={isValid}
                forceValidate={forceValidate}
                message={validationMessage}
                placeholder={intl.formatMessage(payeeAccount)}
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
                <FormattedMessage {...button} />
            </ButtonTertiary>
        </Form>
        <ModalOperation
            cancelCallback={onCancelTransfer}
            isOpen={transferInProgress}
            header={transferOutHeader}
            progressMessage={paymentMessage}
            progressPercent={percentComplete}
            messageValues={transferValues}
        />
        </React.Fragment>
    );
}
