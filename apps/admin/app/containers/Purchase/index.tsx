import * as React from 'react';
import { connect } from 'react-redux';
import { Form, Header, Confirm, Select } from 'semantic-ui-react';
import Datetime from 'react-datetime';
import { Moment } from 'moment';

import { toHuman } from '@the-coin/utilities';
import { roundPlaces } from '@the-coin/utilities/Conversion';


import { getFxRate, FxRatesState, IFxRates, selectFxRate, mapDispatchToProps } from '@the-coin/shared/containers/FxRate';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import { AccountState } from '@the-coin/shared/containers/Account/types';
import { DualFxInput } from '@the-coin/shared/components/DualFxInput';
import { UxAddress } from '@the-coin/shared/components/UxAddress';

import messages from './messages';
import "react-datetime/css/react-datetime.css"
import { GetActionDoc } from '@the-coin/utilities/User';
import { NextOpenTimestamp } from '@the-coin/utilities/MarketStatus';
import { GetAccountCode } from 'containers/BrokerTransferAssistant/Wallet';
import { DocumentReference } from '@the-coin/types/FirebaseFirestore';
import { DepositRecord, PurchaseType } from 'containers/TransferList/types';
import { fromMillis } from 'utils/Firebase';

import { now } from 'utils/Firebase';
//import { firestore } from 'firebase';

type MyProps = AccountState & {
  updateBalance: Function
}
type Props = MyProps & FxRatesState & IFxRates;

const initialState = {
  coin: 0,
  account: "",
  purchaserCode: "---",

  recievedDate: new Date(),
  settledDate: new Date(),

  email: "",
  type: PurchaseType.other,

  txHash: '',
  step: "",
  isProcessing: false,

  doConfirm: false
}

class PurchaseClass extends React.PureComponent<Props> {

  state = initialState;

  async sendPurchase() {
    const { coin, account, settledDate } = this.state;
    const { contract } = this.props;
    const fxRate = this.getSelectedFxRate()

    if (fxRate.fxRate <= 0) {
      alert("Invalid FxRate!")
      return;
    }
    if (coin <= 0) {
      alert("Invalid Coin")
      return;
    }
    if (settledDate.getTime() > Date.now()) {
      alert("This set for a future date.\nIt is not possible to complete a purchase in the future.")
      return;
    }
    try {
      this.setState({ isProcessing: true, step: "Initializing Transaction" });
      const ts = Math.round(settledDate.getTime() / 1000);

      // First record our intent to send this tx
      //var doc = await this.recordTxOpen();
      // Send the purchase request
      this.setState({ isProcessing: true, step: "Sending Transaction" });

      const tx = await contract.coinPurchase(account, coin, 0, ts);
      // Update the DB with tx hash
      var doc = await this.recordTxHash(tx.hash);

      // Wait for TX to complete on blockchain
      this.setState({ txHash: tx.hash, step: `Waiting on ${tx.hash}` });
      await tx.wait();

      // Record successful tx
      this.setState({ step: `Finalizing` });
      await this.recordTxComplete(doc);
      this.setState({ isProcessing: false });
      alert("Purchase Success")
    } catch (e) {
      alert(e);
    }
    this.setState(initialState)
  }

  async buildPurchaseEntry(type: PurchaseType): Promise<DepositRecord> {
    const { coin, recievedDate, settledDate } = this.state;
    //const { signer } = this.props;
    const { fxRate, sell } = this.getSelectedFxRate();
    const conversionRate = fxRate * sell;
    //const emailHash = await signer.signMessage(email.toLocaleLowerCase());
    return {
      transfer: {
        value: coin,
      },
      fiatDisbursed: toHuman(coin * conversionRate, true),
      recievedTimestamp: fromMillis(recievedDate.getTime()),
      processedTimestamp: fromMillis(settledDate.getTime()),
      confirmed: true,
      hash: 'NONE',
      type,
    };
  }

  async recordTxHash(txHash: string) {
    try {
      const { account, type } = this.state;
      var doc = GetActionDoc(account, "Buy", txHash)
      const record = await this.buildPurchaseEntry(type);
      record.hash = txHash;
      await doc.set(record);
      return doc;
    }
    catch (err) {
      console.error(err);
      alert(err);
      throw (err)
    }
  }

  async recordTxComplete(purchaseDoc: DocumentReference) {
    try {
      const data: Partial<DepositRecord> = {
        completedTimestamp: now()
      }
      await purchaseDoc.update(data);
    }
    catch (err) {
      console.error(err);
      alert(err);
      throw (err);
    }
  }

  async getValidDate(moment: Moment) {
    const asDate = moment.toDate();
    const nextTs = await NextOpenTimestamp(asDate);
    if (nextTs)
      return new Date(nextTs);
    return asDate;
  }

  onSetDate = async (value: string | Moment) => {
    const asm = value as Moment
    if (asm.toDate != undefined) {
      const asDate = await this.getValidDate(asm);
      this.setState({
        recievedDate: asm.toDate(),
        settledDate: asDate
      });
      this.props.fetchRateAtDate(asDate);
    }
  }

  getSelectedFxRate() {
    const { settledDate } = this.state;
    const { rates } = this.props;
    const rate = getFxRate(rates, settledDate.getTime());
    return rate;
  }

  resetInputs() {
    this.setState(initialState)
  }

  // Validate our inputs
  onAccountValue = (value: string) => {
    this.setState({
      account: value,
    });
    this.updateCode(value);
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


  async updateCode(account: string) {
    const code = await GetAccountCode(account);
    this.setState({
      purchaserCode: code,
     });
  }

  renderShortDate = (date: Date) => date.toLocaleDateString("en-US", { day: "numeric", hour: "numeric", minute: "numeric" })

  getTypeOptions = () => Object.keys(PurchaseType).map(k => ({
    key: k,
    value: k,
    text: k
  }));


  render() {
    const { coin, recievedDate, settledDate, isProcessing, step, purchaserCode, type } = this.state
    const { balance } = this.props;
    const fxRate = this.getSelectedFxRate();
    const sellRate = fxRate.sell * fxRate.fxRate;
    const validFrom = new Date(fxRate.validFrom);
    const validTill = new Date(fxRate.validTill);

    const forceValidate = false;

    return (
      <React.Fragment>
        <Header>Purchase</Header>
        <p>Current Balance: {toHuman(balance, true)} </p>
        <Form>
          <Datetime value={recievedDate} onChange={this.onSetDate} />
          <p>Settled: {settledDate.toString()}</p>
          <p>
            FxRate: {roundPlaces(sellRate)} <br />
            + Valid: {this.renderShortDate(validFrom)} -> {this.renderShortDate(validTill)}<br />
            + THE: {fxRate.sell} <br />
            + CAD: {fxRate.fxRate} <br />
          </p>
          <UxAddress
            uxChange={this.onAccountValue}
            intlLabel={messages.labelAccount}
            forceValidate={forceValidate}
            placeholder="Purchaser Account"
          />
          <p>Purchaser Code: {purchaserCode}</p>
          <Select value={type} options={this.getTypeOptions()} onChange={this.onSetType}/>
          <DualFxInput onChange={this.handleCoinChange} maxValue={balance} asCoin={true} value={coin} fxRate={sellRate} />
          <Form.Button onClick={this.confirmOpen}>SEND</Form.Button>
        </Form>
        <Confirm open={this.state.doConfirm} onCancel={this.confirmClose} onConfirm={this.handleConfirm} />
        <ModalOperation isOpen={isProcessing} header={messages.mintingHeader} progressMessage={messages.mintingInProgress} messageValues={{ step }} />
      </React.Fragment>
    );
  }
}

export const Purchase = connect(selectFxRate, mapDispatchToProps)(PurchaseClass);

