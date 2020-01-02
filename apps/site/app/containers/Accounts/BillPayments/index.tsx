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
import { ContainerState as FxState } from '@the-coin/shared/containers/FxRate/types';
import { weBuyAt } from '@the-coin/shared/containers/FxRate/reducer';
import { selectFxRate } from '@the-coin/shared/containers/FxRate/selectors';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import { AccountState } from '@the-coin/shared/containers/Account/types';
import messages from './messages';
import { payees, validate } from './payees';
import { BillPayeePacket } from '@the-coin/types';
import {
  GetStatusApi,
  GetBillPaymentsApi,
} from 'containers/Services/BrokerCAD';
import { UxInput } from '@the-coin/shared/components/UxInput';

import styles from '../../../styles/base.css';

type MyProps = {
  account: AccountState;
};

type Props = MyProps & FxState;

const initialState = {
  coinToSell: null as number | null,

  // The data required to submit a bill payment
  payee: '',
  accountNumber: '',
  payeeName: '',

  accountNumberValid: false,
  forceValidate: false,

  transferInProgress: false,
  paymentMessage: messages.transferOutProgress,
  transferValues: undefined as any,
  percentComplete: 0,
  doCancel: false,
};

type StateType = Readonly<typeof initialState>;

class BillPaymentsClass extends React.PureComponent<Props, StateType> {
  state = initialState;

  onPayeeSelect = (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => this.setState({ payee: (data.value as string) || '' });
  onNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => this.setState({ payeeName: data.value });
  onValueChange = (value: number) => this.setState({ coinToSell: value });
  onCancelTransfer = () => this.setState({ doCancel: true });
  onSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    this.doSubmit();
  };
  onAccountNumber = (value: string) => {
    const isValid = validate(this.state.payee, value);
    this.setState({
      accountNumberValid: isValid,
      accountNumber: value,
    });
  };
  async doBillPayment() {
    // Init messages
    this.setState({ paymentMessage: messages.step1, percentComplete: 0.0 });

    // First, get the brokers fee
    const statusApi = GetStatusApi();
    var status = await statusApi.status();
    // Check out if we have the right values
    if (!status.certifiedFee) return false;

    if (this.state.doCancel) return false;

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
      status.address,
      coinToSell,
      status.certifiedFee,
    );
    const billPayApi = GetBillPaymentsApi();
    if (this.state.doCancel) return false;

    // Send the command to the server
    this.setState({ paymentMessage: messages.step2, percentComplete: 0.25 });
    const response = await billPayApi.billPayment(billPayCommand);

    console.log(`Response: ${response.message}`);
    if (!response.txHash) {
      alert(JSON.stringify(response));
      return false;
    }

    // Wait on the given hash
    const transferValues = {
      link: (
        <a
          target="_blank"
          href={`https://ropsten.etherscan.io/tx/${response.txHash}`}
        >
          here
        </a>
      ),
    };
    this.setState({
      paymentMessage: messages.step3,
      percentComplete: 0.5,
      transferValues,
    });
    const tx = await contract.provider.getTransaction(response.txHash);
    // Wait at least 2 confirmations
    tx.wait(2);
    const receipt = await contract.provider.getTransactionReceipt(
      response.txHash,
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
    const { coinToSell, payee, accountNumber, accountNumberValid } = this.state;
    if (!coinToSell || !payee || !accountNumber || !accountNumberValid) return;

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
      accountNumberValid,
      forceValidate,
    } = this.state;
    const accountMessage = accountNumberValid
      ? undefined
      : messages.invalidAccountNumer;
    const canSubmit = accountNumberValid && coinToSell;
    return (
      <React.Fragment>
        <div className={styles.wrapper}>
          <Form>
            <Header as="h1">
              <Header.Content>
                <FormattedMessage {...messages.header} />
              </Header.Content>
              <Header.Subheader>
                <FormattedMessage {...messages.subHeader} />
              </Header.Subheader>
            </Header>

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
              intlLabel={messages.accountNumer}
              uxChange={this.onAccountNumber}
              isValid={accountNumberValid}
              forceValidate={forceValidate}
              message={accountMessage}
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
            <Form.Button onClick={this.onSubmit} disabled={!canSubmit}>
              SEND
            </Form.Button>
          </Form>
          <ModalOperation
            cancelCallback={this.onCancelTransfer}
            isOpen={transferInProgress}
            header={messages.transferOutHeader}
            progressMessage={paymentMessage}
            progressPercent={percentComplete}
            messageValues={transferValues}
          />
        </div>
      </React.Fragment>
    );
  }
}

export const BillPayments = connect(selectFxRate)(BillPaymentsClass);
