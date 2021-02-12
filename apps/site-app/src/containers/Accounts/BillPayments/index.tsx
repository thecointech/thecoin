import * as React from 'react';
import { connect } from 'react-redux';
import {
  Form,
  Header,
  Dropdown,
  DropdownProps,
  InputOnChangeData,
} from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { BuildVerifiedBillPayment } from '@the-coin/utilities/VerifiedBillPayment';
import { DualFxInput } from '@the-coin/shared/components/DualFxInput';
import { FxRatesState } from '@the-coin/shared/containers/FxRate/types';
import { weBuyAt } from '@the-coin/shared/containers/FxRate/reducer';
import { selectFxRate } from '@the-coin/shared/containers/FxRate/selectors';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import { AccountState } from '@the-coin/shared/containers/Account/types';
import { payees, validate } from './payees';
import { BillPayeePacket } from '@the-coin/types';
import { GetStatusApi, GetBillPaymentsApi } from 'api';
import { UxInput } from '@the-coin/shared/components/UxInput';
import { ValuedMessageDesc } from '@the-coin/shared/components/UxInput/types';
import { ButtonTertiary } from '@the-coin/site-base/components/Buttons';

import banks from './images/icon_bank_big.svg';
import visa from './images/icon_visa_big.svg';
import taxes from './images/icon_taxes_big.svg';
import other from './images/icon_other_big.svg';
import all from './images/icon_all_big.svg';

import styles from './styles.module.less';

type MyProps = {
  account: AccountState;
};

type Props = MyProps & FxRatesState;

const description = { id:"app.accounts.billPayments.description",
                defaultMessage:"You can pay your bills directly from The Coin. Select payee:",
                description:"Description for the make a payment page / bill payment tab" };
/* This class will need to be changed in order to use that translation
const payee = { id:"app.accounts.billPayments.form.payee",
                defaultMessage:"Select Payee",
                description:"Label for the form the make a payment page / bill payment tab" };*/
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

const initialState = {
  coinToSell: null as number | null,

  // The data required to submit a bill payment
  payee: '',
  accountNumber: '',
  payeeName: '',

  validationMessage: null as ValuedMessageDesc|null,
  forceValidate: false,

  transferInProgress: false,
  paymentMessage: transferOutProgress,
  transferValues: undefined as any,
  percentComplete: 0,
  doCancel: false,
};

type StateType = Readonly<typeof initialState>;

class BillPaymentsClass extends React.PureComponent<Props, StateType> {
  state = initialState;

  onPayeeSelect = (
    _: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => this.setState({ payee: (data.value as string) || '' });
  onNameChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => this.setState({ payeeName: data.value });
  onValueChange = (value: number) => this.setState({ coinToSell: value });
  onCancelTransfer = () => this.setState({ doCancel: true });
  onSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    this.doSubmit();
  };
  onAccountNumber = (value: string) => {
    const validation = validate(this.state.payee, value);
    this.setState({
      validationMessage: validation,
      accountNumber: value,
    });
  };
  async doBillPayment() {
    // Init messages
    this.setState({ paymentMessage: step1, percentComplete: 0.0 });

    // First, get the brokers fee
    const statusApi = GetStatusApi();
    var {data} = await statusApi.status();
    // Check out if we have the right values
    if (!data?.certifiedFee)
      return false;

    if (this.state.doCancel)
      return false;

    // Get our variables
    const { coinToSell, payee, accountNumber } = this.state;
    const { signer, contract } = this.props.account;
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
    if (this.state.doCancel) return false;

    // Send the command to the server
    this.setState({ paymentMessage: step2, percentComplete: 0.25 });
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
    this.setState({
      paymentMessage: step3,
      percentComplete: 0.5,
      transferValues,
    });
    const tx = await contract.provider.getTransaction(txHash);
    // Wait at least 2 confirmations
    tx.wait(2);
    const receipt = await contract.provider.getTransactionReceipt(
      txHash,
    );
    console.log(
      `Transfer mined in ${receipt.blockNumber} - ${receipt.blockHash}`,
    );
    this.setState({ percentComplete: 1 });
    return true;
  }

  async doSubmit() {
    this.setState({
      doCancel: false,
      transferValues: undefined,
      transferInProgress: true,
      forceValidate: true,
    });

    // Validate inputs
    const { coinToSell, payee, accountNumber, validationMessage } = this.state;
    const isValid = !validationMessage;
    if (!coinToSell || !payee || !accountNumber || !isValid) return;

    try {
      const results = await this.doBillPayment();
      if (!results) {
        alert(
          "We have encountered an error.\nDon't worry, your money is safe, but please contact support@thecoin.io and describe whats happened",
        );
      } else
        alert(
          'Order recieved.\nYour bill payment will be processed in the next 1-2 business days.\nPlease note that bill payments can take several days to settle,\nso paying a few days early ensures that payments are recieved on time.',
        );

      // Reset back to default state
      this.setState(initialState);
    } catch (e) {
      console.error(e);
      alert(e);
    }
    this.setState(initialState);
  }

  render() {
    const { account, rates } = this.props;
    const rate = weBuyAt(rates);
    const {
      coinToSell,
      transferInProgress,
      transferValues,
      paymentMessage,
      percentComplete,
      validationMessage,
      forceValidate,
    } = this.state;
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

          <div className={styles.app}>
            <ul className={styles.hs}>
              <li className={ `${styles.item} ${styles.selectableCards}` }>
                  <input id="all" type="radio" name="payeeType" value="all" defaultChecked />
                  <label htmlFor="all">
                    <img src={all} />
                    <br />
                    <span>All</span>
                  </label>
              </li>
              <li className={ `${styles.item} ${styles.selectableCards}` }>
                    <input id="banks" type="radio" name="payeeType" value="banks" />
                  <label htmlFor="banks">
                    <img src={banks} />
                    <br />
                    <span>Banks</span>
                  </label>
              </li>
              <li className={ `${styles.item} ${styles.selectableCards}` }>
                  <input id="visa" type="radio" name="payeeType" value="visa" />
                  <label htmlFor="visa">
                    <img src={visa} />
                    <br />
                    <span>Visa Card</span>
                  </label>
              </li>
              <li className={ `${styles.item} ${styles.selectableCards}` }>
                  <input id="taxes" type="radio" name="payeeType" value="taxes" />
                  <label htmlFor="taxes">
                    <img src={taxes} />
                    <br />
                    <span>Taxes</span>
                  </label>
              </li>
              <li className={ `${styles.item} ${styles.selectableCards}` }>
                  <input id="other" type="radio" name="payeeType" value="other" />
                  <label htmlFor="other">
                    <img src={other} />
                    <br />
                    <span>Other</span>
                  </label>
              </li>
            </ul>
          </div>
          <Dropdown
            placeholder="Select Payee"
            fluid
            search
            selection
            allowAdditions
            options={payees}
            onChange={this.onPayeeSelect}
          />
          <UxInput
            intlLabel={accountNumer}
            uxChange={this.onAccountNumber}
            isValid={isValid}
            forceValidate={forceValidate}
            message={validationMessage}
            placeholder="Payee account number"
          />
          {/*<Form.Input label="Bill Name" onChange={this.onNameChange} placeholder="An optional name to remember this payee by" /> */}
          <DualFxInput
            onChange={this.onValueChange}
            asCoin={true}
            maxValue={account.balance}
            value={coinToSell}
            fxRate={rate}
          />
          <ButtonTertiary onClick={this.onSubmit} disabled={!canSubmit}>
              <FormattedMessage {...button} />
          </ButtonTertiary>
        </Form>
        <ModalOperation
          cancelCallback={this.onCancelTransfer}
          isOpen={transferInProgress}
          header={transferOutHeader}
          progressMessage={paymentMessage}
          progressPercent={percentComplete}
          messageValues={transferValues}
        />
      </React.Fragment>
    );
  }
}

export const BillPayments = connect(selectFxRate)(BillPaymentsClass);
