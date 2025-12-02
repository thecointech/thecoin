import * as React from 'react';
import { Form, Header, Confirm, Select } from 'semantic-ui-react';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { DualFxInput } from '@thecointech/shared/components/DualFxInput';
import { UxAddress } from '@thecointech/shared/components/UX/Address';
import { toHuman } from '@thecointech/utilities';
import { BuyAction, getActionFromInitial, PurchaseType } from '@thecointech/broker-db';
import { manualProcessor } from '@thecointech/tx-deposit';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import messages from './messages';
import { getCurrentState } from '@thecointech/tx-statemachine';
import { AccountMap } from '@thecointech/redux-accounts';
import { Account } from '@thecointech/shared/containers/Account';

const typeOptions = ["deposit", "other"].map(k => ({
  key: k,
  value: k,
  text: k
}));

export const Purchase = () => {

  const [purchaser, setPurchaser] = React.useState<MaybeString>();
  const [forceValidate, setForceValidate] = React.useState(false);
  const [type, setType] = React.useState<PurchaseType>("deposit");
  const [fiat, setFiat] = React.useState(0);
  const [confirm, setConfirm] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const account = AccountMap.useActive()!;
  const api = Account(account.address).useApi();

  const onConfirm = async () => {
    setConfirm(false);
    setForceValidate(true);
    if (!purchaser || !fiat)
      return false;

    setIsProcessing(true);
    throw new Error("Just because it compiles, doesn't mean it works.  Check properly");
    const date = DateTime.now();
    const buy = await buildPurchaseEntry(fiat, date, purchaser!, type);
    const processor = manualProcessor(account.contract!, {
      fiat: new Decimal(fiat),
      meta: "Fill this in",
      date
    });
    const result = await processor.execute(null, buy);
    // Update with the step we get to.
    // TODO: Could we make this a callback?
    const current = getCurrentState(result);
    //setState({ txHash: current.data.hash, step: current.name});
    alert('You could be done' + current.data.hash);
    api.updateHistory(DateTime.now(), DateTime.now());
    setIsProcessing(false);
  }


  return (
    <>
      <Header>Purchase</Header>
      <p>Current Balance: {toHuman(account.balance, true)} </p>
      <Form>
        {/* <Datetime value={recievedDate} onChange={this.onSetDate} /> */}
        <UxAddress
          onValue={setPurchaser}
          intlLabel={messages.labelAccount}
          forceValidate={forceValidate}
        />
        <Select value={type} options={typeOptions} onChange={event => setType(event.currentTarget.innerText as PurchaseType)} />
        <DualFxInput onChange={setFiat} maxValue={account.balance} value={fiat} fxRate={1} />
        <Form.Button onClick={() => setConfirm(true)}>SEND</Form.Button>
      </Form>
      <Confirm open={confirm} onCancel={() => setConfirm(false)} onConfirm={onConfirm} />
      <ModalOperation isOpen={isProcessing} header={messages.mintingHeader} progressMessage={messages.mintingInProgress} />
    </>
  )
}

async function buildPurchaseEntry(fiat: number, date: DateTime, address: string, type: string): Promise<BuyAction> {
  if (type != 'deposit') throw new Error("We don't have a good method for supporting this yet");
  // Our goal is to create an initial ID that is unique for the client.
  // The following should be good enough (?).
  const initialId = `${type}-${date.toMillis()}-${fiat}`;
  return await getActionFromInitial(address, "Buy", {
    initialId,
    date,
    initial: {
      amount: new Decimal(fiat),
      type,
    }
  })
}
