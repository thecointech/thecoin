import * as React from 'react';
import { useIntl } from 'react-intl';
import { NormalizeAddress } from '@thecointech/utilities';
import { BuildVerifiedXfer } from '@thecointech/utilities/VerifiedTransfer';
import { GetStatusApi, GetDirectTransferApi } from 'api';
import { DualFxInput } from '@thecointech/shared/components/DualFxInput';
import { UxAddress } from '@thecointech/shared/components/UxAddress';
import { FxRatesState } from '@thecointech/shared/containers/FxRate/types';
import { weBuyAt } from '@thecointech/shared/containers/FxRate/reducer';
import { selectFxRate } from '@thecointech/shared/containers/FxRate/selectors';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { AccountState } from '@thecointech/shared/containers/Account/types';
import { ButtonTertiary } from '@thecointech/site-base/components/Buttons';

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
const destinationAddress = { id:"app.accounts.transfert.destinationAddress",
                            defaultMessage:"Destination Address",
                            description:"destinationAddress for the make a payment page / transfert tab" };

const button = { id:"app.accounts.transfert.form.button",
                defaultMessage:"Transfert",
                description:"Label for the form the make a payment page / transfert tab" };

export const Transfer = () => {

  const [coinTransfer, setCoinTransfer] = useState(null as number | null);
  const [toAddress, setToAddress] = useState('');
  const [forceValidate] = useState(false);

  const [transferInProgress, setTransferInProgress] = useState(false);
  const [transferMessage, setTransferMessage] = useState(transferOutProgress);
  const [transferValues, setTransferValues] = useState(undefined as any);
  const [percentComplete, setPercentComplete] = useState(0);
  const [doCancel, setDoCancel] = useState(false);

  const account = useActiveAccount();
  const { rates } = useFxRates();
  const rate = weBuyAt(rates);
  const intl = useIntl();
  
  const doTransfer = async () => { 
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
    setTransferMessage(step2);
    setPercentComplete(0.25);
    const response = await transferApi.transfer(transferCommand);

    console.log(`TxResponse: ${response.data.message}`);
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

  const onSubmit = async (e: React.MouseEvent<HTMLElement>) => { 
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
      description={description} 
      onValueChange={onValueChange} 
      account={account!}
      coinTransfer={coinTransfer}
      rate={rate}

      onAccountValue={onAccountValue}
      forceValidate={forceValidate}
      onSubmit={onSubmit}
      button={button}
      destinationAddress={intl.formatMessage(destinationAddress)}

      onCancelTransfer={onCancelTransfer}
      transferInProgress={transferInProgress}
      transferOutHeader={transferOutHeader}
      transferMessage={transferMessage}
      percentComplete={percentComplete}
      transferValues={transferValues} />
  );
}