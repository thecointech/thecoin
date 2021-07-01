import * as React from 'react';
import { Form, Header, Confirm, Select } from 'semantic-ui-react';
import Datetime from 'react-datetime';
import { Moment } from 'moment';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { DualFxInput } from '@thecointech/shared/components/DualFxInput';
import { UxAddress } from '@thecointech/shared/components/UxAddress';
import { toHuman } from '@thecointech/utilities';
import { BuyAction, getActionFromInitial, PurchaseType } from '@thecointech/broker-db';
import { Processor } from '@thecointech/tx-processing/deposit';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import messages from './messages';
import { getCurrentState } from '@thecointech/tx-processing/statemachine';
import { AccountState } from '@thecointech/account';
import "react-datetime/css/react-datetime.css"


type Props = AccountState & {
  updateBalance: Function
}

const initialState = {
  fiat: 0,
  address: "",
  purchaserCode: "---",

  recievedDate: new Date(),

  type: "deposit" as PurchaseType,

  txHash: '',
  step: "",
  isProcessing: false,

  doConfirm: false
}

export class Purchase extends React.PureComponent<Props> {

  state = initialState;


  async buildPurchaseEntry(): Promise<BuyAction> {
    const { fiat, recievedDate, address, type } = this.state;
    if (type != 'deposit') throw new Error("We don't have a good method for supporting this yet");
    // This is as good as we can get...
    const initialId = `${type}-${recievedDate.getTime()}-${fiat}`;
    return await getActionFromInitial(address, "Buy", {
      initialId,
      date: DateTime.fromJSDate(recievedDate),
      initial: {
        amount: new Decimal(fiat),
        type,
      }
    })
  }

  async sendPurchase() {
    throw new Error("Just because it compiles, doesn't mean it works.  Check properly");
    this.setState({isProcessing: true});
    const buy = await this.buildPurchaseEntry();
    const processor = Processor(this.props.contract!);
    const result = await processor.execute(null, buy);
    // Update with the step we get to.
    // TODO: Could we make this a callback?
    const current = getCurrentState(result);
    this.setState({ txHash: current.data.hash, step: current.name});
  }

  onSetDate = async (value: string|Moment) => {
    if (typeof value !== 'string') {
      this.setState({
        recievedDate: value.toDate(),
      });
    }
  }

  resetInputs() {
    this.setState(initialState)
  }

  // Validate our inputs
  onAccountValue = (value: string) => {
    this.setState({
      address: value,
    });
  }
  onSetType = (event: React.SyntheticEvent<HTMLElement, Event>) => {
    this.setState({
      type: event.currentTarget.innerText
    })
  }
  handleCoinChange = (value: number) => this.setState({ coin: value })
  confirmOpen = () => this.setState({ doConfirm: true })
  confirmClose = () => this.setState({ doConfirm: false })
  handleConfirm = async () => {
    this.setState({ doConfirm: false })
    await this.sendPurchase()
    this.resetInputs();
  }

  renderShortDate = (date: Date) => date.toLocaleDateString("en-US", { day: "numeric", hour: "numeric", minute: "numeric" })

  getTypeOptions = () => ["deposit", "other"].map(k => ({
    key: k,
    value: k,
    text: k
  }));


  render() {
    const { fiat, recievedDate, isProcessing, step, purchaserCode, type } = this.state
    const { balance } = this.props;
    const forceValidate = false;

    return (
      <React.Fragment>
        <Header>Purchase</Header>
        <p>Current Balance: {toHuman(balance, true)} </p>
        <Form>
          <Datetime value={recievedDate} onChange={this.onSetDate} />
          <UxAddress
            uxChange={this.onAccountValue}
            intlLabel={messages.labelAccount}
            forceValidate={forceValidate}
            placeholder="Purchaser Account"
          />
          <p>Purchaser Code: {purchaserCode}</p>
          <Select value={type} options={this.getTypeOptions()} onChange={this.onSetType}/>
          <DualFxInput onChange={this.handleCoinChange} maxValue={balance} value={fiat} fxRate={1} />
          <Form.Button onClick={this.confirmOpen}>SEND</Form.Button>
        </Form>
        <Confirm open={this.state.doConfirm} onCancel={this.confirmClose} onConfirm={this.handleConfirm} />
        <ModalOperation isOpen={isProcessing} header={messages.mintingHeader} progressMessage={messages.mintingInProgress} messageValues={{ step }} />
      </React.Fragment>
    );
  }
}
