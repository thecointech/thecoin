import * as React from 'react';
import { connect } from 'react-redux';
import { Form, Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import { NormalizeAddress } from '@the-coin/utilities/';
import { BuildVerifiedXfer } from '@the-coin/utilities/VerifiedTransfer';
import { GetStatusApi, GetDirectTransferApi } from 'api';
import { DualFxInput } from '@the-coin/shared/components/DualFxInput';
import { UxAddress } from '@the-coin/shared/components/UxAddress';
import { FxRatesState } from '@the-coin/shared/containers/FxRate/types';
import { weBuyAt } from '@the-coin/shared/containers/FxRate/reducer';
import { selectFxRate } from '@the-coin/shared/containers/FxRate/selectors';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import { AccountState } from '@the-coin/shared/containers/Account/types';
import { ButtonTertiary } from '@the-coin/site-base/components/Buttons';
import { useState } from 'react';

type MyProps = {
  account: AccountState;
};

type Props = MyProps & FxRatesState;

const description = { id:"app.accounts.transfert.description",
                defaultMessage:"Transfer directly to another account with TheCoin.",
                description:"Description for the make a payment page / transfert tab" };
const transferOutHeader = { id:"app.accounts.transfert.transferHeader",
                defaultMessage:"Processing Transfer...",
                description:"transferHeader for the make a payment page / transfert tab" };
const step1 = { id:"app.accounts.transfert.step1",
                defaultMessage:"Step 1 of 3: Checking transfer availability...",
                description:"Message for step1 for the make a payment page / transfert tab" };
const step2 = { id:"app.accounts.transfert.step2",
                defaultMessage:"Step 2 of 3: Sending transfer command to our servers...",
                description:"Message for step2 for the make a payment page / transfert tab" };
const step3 = { id:"app.accounts.transfert.step3",
                defaultMessage:"Step 3 of 3: Waiting for the transfer to be accepted\n(check progress {link})...",
                description:"Message for step3 for the make a payment page / transfert tab" };
const transferOutProgress = { id:"app.accounts.transfert.transferOutProgress",
                defaultMessage:"Please wait, we are sending your order to our servers...",
                description:"transferOutProgress for the make a payment page / transfert tab" };

const button = { id:"app.accounts.transfert.form.button",
                defaultMessage:"Transfert",
                description:"Label for the form the make a payment page / transfert tab" };

export const TransferClass = (props: Props) => {
  //class TransferClass extends React.PureComponent<Props, StateType> {

  const [coinTransfer, setCoinTransfer] = useState(null as number | null);
  const [toAddress, setToAddress] = useState('');
  const [forceValidate] = useState(false);

  const [transferInProgress, setTransferInProgress] = useState(false);
  const [transferMessage, setTransferMessage] = useState(transferOutProgress);
  const [transferValues, setTransferValues] = useState(undefined as any);
  const [percentComplete, setPercentComplete] = useState(0);
  const [doCancel, setDoCancel] = useState(false);

  async function doTransfer() {
    // Init messages
    setTransferMessage(step1);
    setPercentComplete(0.0);
    // First, get the brokers fee
    const statusApi = GetStatusApi(); //undefined, "http://localhost:8080"
    var status = await statusApi.status();
    // Check out if we have the right values
    if (!status.data.certifiedFee) return false;

    if (doCancel) return false;

    // Get our variables
    //const { coinTransfer, toAddress } = this.state;
    const { signer, contract } = props.account;
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
    setTransferMessage(step2);
    setPercentComplete(0.25);
    const response = await transferApi.transfer(transferCommand);

    //console.log(`TxResponse: ${response.data.message}`);
    if (!response.data.txHash) {
      alert(response.data.message);
      return false;
    }

    // Wait on the given hash
    const transferValues = {
      link: (<a target="_blank" href={`https://ropsten.etherscan.io/tx/${response.data.txHash}`}> here </a>),
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
    console.log(`Transfer mined in ${receipt.blockNumber} - ${receipt.blockHash}`,);
    setPercentComplete(1);
    return true;
  }

  async function onSubmit(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();

    setDoCancel(false);
    setTransferValues(undefined);
    setTransferInProgress(true);

    try {
      const result = await doTransfer();
      if (!result) alert('Transfer Failure');
      else alert('Transfer Success');
    } catch (err) {
      console.error(err);
      alert('Transfer Error');
    }
    setPercentComplete(1);
    setTransferInProgress(true);
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
  const { account, rates } = props;
  const rate = weBuyAt(rates);
  return (
    <React.Fragment>
      <Form>
        <Header as="h5">
          <Header.Subheader>
            <FormattedMessage {...description} />
          </Header.Subheader>
        </Header>

        <DualFxInput
          onChange={onValueChange}
          asCoin={true}
          maxValue={account.balance}
          value={coinTransfer}
          fxRate={rate}
        />
        <UxAddress
          uxChange={onAccountValue}
          forceValidate={forceValidate}
          placeholder="Destination Address"
        />
        <ButtonTertiary onClick={onSubmit}>
            <FormattedMessage {...button} />
        </ButtonTertiary>
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

export const Transfer = connect(selectFxRate)(TransferClass);
