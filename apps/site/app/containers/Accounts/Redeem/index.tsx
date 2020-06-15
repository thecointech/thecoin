import * as React from 'react';
import { connect } from 'react-redux';
import { Form, Header, Dropdown, DropdownItemProps } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { BuildVerifiedSale } from '@the-coin/utilities/VerifiedSale';
import { DualFxInput } from '@the-coin/shared/components/DualFxInput';
import { FxRatesState } from '@the-coin/shared/containers/FxRate/types';
import { weBuyAt } from '@the-coin/shared/containers/FxRate/reducer';
import { selectFxRate } from '@the-coin/shared/containers/FxRate/selectors';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import { AccountState } from '@the-coin/shared/containers/Account/types';
import messages from './messages';
import { GetStatusApi, GetETransferApi } from 'api'
import styles from './index.module.css';
import { ETransferPacket } from '@the-coin/types';

type MyProps = {
  account: AccountState;
};
//useAccountApi myProps this.props.account
// drop down bill payments: fluidsearch
type Props = MyProps & FxRatesState;

const initialState = {
  coinToSell: null as number | null,
  email: '',
  question: '',
  answer: '',
  message: undefined as string | undefined,
  transferInProgress: false,
  transferMessage: messages.transferOutProgress,
  transferValues: undefined as any,
  percentComplete: 0,
  doCancel: false,
  options: null as DropdownItemProps[] | null,
  isFetching: false,
  templates: null as any[] | null,
  prevState: null
};

type StateType = Readonly<typeof initialState>;

class RedeemClass extends React.PureComponent<Props, StateType> {
  state = initialState;

  async doSale() {
    // Init messages
    this.setState({ transferMessage: messages.step1, percentComplete: 0.0 });

    // First, get the brokers fee
    const statusApi = GetStatusApi();
    var {data} = await statusApi.status();
    // Check out if we have the right values
    if (!data.certifiedFee) return false;

    if (this.state.doCancel) return false;

    // Get our variables
    const { coinToSell, email, question, answer, message } = this.state;
    const { signer, contract } = this.props.account;
    if (coinToSell === null || !signer || !contract)
      return false;

    // To redeem, we construct & sign a message that
    // that allows the broker to transfer TheCoin to itself
    const eTransfer: ETransferPacket = {
      email, question, answer, message
    }
    const command = await BuildVerifiedSale(
      eTransfer,
      signer,
      data.address,
      coinToSell,
      data.certifiedFee,
    );
    const eTransferApi = GetETransferApi();

    if (this.state.doCancel)
      return false;

    // Send the command to the server
    this.setState({ transferMessage: messages.step2, percentComplete: 0.25 });
    const response = await eTransferApi.eTransfer(command);

    if (!response.data?.txHash) {
      console.log(`Error: ${JSON.stringify(response)}`);
      return false;
    }

    // Wait on the given hash
    const transferValues = {
      link: (
        <a
          target="_blank"
          href={`https://ropsten.etherscan.io/tx/${response.data.txHash}`}
        >
          here
        </a>
      ),
    };
    this.setState({
      transferMessage: messages.step3,
      percentComplete: 0.5,
      transferValues,
    });
    const tx = await contract.provider.getTransaction(response.data.txHash);
    // Wait at least 2 confirmations
    tx.wait(2);
    const receipt = await contract.provider.getTransactionReceipt(
      response.data.txHash,
    );
    console.log(
      `Transfer mined in ${receipt.blockNumber} - ${receipt.blockHash}`,
    );
    this.setState({ percentComplete: 1 });
    return true;
  }

  onSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    if (e) e.preventDefault();
    this.setState({
      doCancel: false,
      transferValues: undefined,
      transferInProgress: true,
    });
    try {
      const results = await this.doSale();
      if (!results) {
        alert(
          "We have encountered an error.\nDon't worry, your money is safe, but please still contact support@thecoin.io",
        );
      } else
        alert(
          'Order recieved.\nYou should receive the e-Transfer in 1-2 business days.',
        );
    } catch (e) {
      console.error(e);
      alert(e);
    }
    this.setState({ doCancel: false, transferInProgress: false });
  }

  onValueChange = (value: number) => {
    this.setState({
      coinToSell: value,
    });
  }

  onInputChanged = (event: React.FormEvent<HTMLInputElement>) => {
    const { value, name } = event.currentTarget;
    this.setState({
      [name]: value,
    } as any);
  }

  onCancelTransfer() {
    this.setState({ doCancel: true });
  }

  async loadTemplate(){
    const { account } = this.props;
    const space = await account.box.openSpace('TheCoin')
    await space.syncDone
    let compressedTemplates = await space.private.get('etransferTemplate')
    let tableWithTemplates = compressedTemplates.split("||")
    let templatesList: any[] = []
    let optionsForDropdown: { key: any; text: any; value: any; }[] = []
    tableWithTemplates.forEach(function (value: any, index: number) {
      let template = JSON.parse(value)
      optionsForDropdown.push({ key: template.name+index, text: template.name, value: template.name+index })
      templatesList[template.name+index] = template
    });
    this.setState({
      options: optionsForDropdown,
      templates: templatesList
    });
  }


  handleTemplateChange = (event, {value}: any) => {
    this.setState({ value })
    const { options, templates } = this.state
    if (templates != null){
      console.log(options, templates[value])
      let choseTemplate = templates[value]
      //this.fillTheForm(chosedTemplate.sell, chosedTemplate.email, chosedTemplate.question, chosedTemplate.answer, chosedTemplate.message)
      if (choseTemplate != undefined){
        var f = document.forms[0];
        f[0].value = choseTemplate.xCAD
        f[1].value = choseTemplate.xTHE
        f[2].value = choseTemplate.email
        f[3].value = choseTemplate.question
        f[4].value = choseTemplate.answer
        f[5].value = choseTemplate.message
      }
    }
  }

  handleAddTemplate = (e, { value }) => {
    this.setState((prevState) => ({
      options: [{ text: value, value }, ...prevState.options],
    }))
  }

  fillTheForm(sell: number, email: string, question: string, answer: string, message: string){
    this.setState({
      coinToSell: sell,
      email: email,
      question: question,
      answer: answer,
      message: message,
    });
  }

  // TODO: clean that
  async saveTemplate() {
    const { account } = this.props;
    var f = document.forms[0];
    const space = await account.box.openSpace('TheCoin')
    await space.syncDone
    //await space.private.remove('etransferTemplate')
    const templateToSave = {
      name:f[7].value ,
      xCAD:f[0].value ,
      xTHE:f[1].value ,
      email:f[2].value ,
      question:f[3].value ,
      answer:f[4].value ,
      message:f[5].value ,
    };

    let templateAlreadySaved = await space.private.get('etransferTemplate')
    if (templateAlreadySaved === null) {
      let templatesToInsert = JSON.stringify(templateToSave)
      await space.private.set('etransferTemplate', templatesToInsert)
    } else {
      let templatesToInsert = templateAlreadySaved+"||"+JSON.stringify(templateToSave)
      await space.private.set('etransferTemplate', templatesToInsert)
    }
    console.log(await space.private.get('etransferTemplate'))
  }
  
  fetchOptions = () => {
    this.setState({ isFetching: true })

    setTimeout(() => {
      this.setState({ isFetching: false, options: this.loadTemplate() })
    }, 500)
  }

  async componentDidMount() {
    //await this.loadTemplate()
  }

  render() {
    const { account, rates } = this.props;
    const { options, isFetching } = this.state
    const rate = weBuyAt(rates);
    const {
      coinToSell,
      transferInProgress,
      transferValues,
      transferMessage,
      percentComplete,
    } = this.state;
    return (
      <React.Fragment>
        <div className={styles.wrapper}>
          <Form name="etransfer">
            <Header as="h1">
              <Header.Content>
                <FormattedMessage {...messages.header} />
              </Header.Content>
              <Header.Subheader>
                <FormattedMessage {...messages.subHeader} />
              </Header.Subheader>
            </Header>

            <DualFxInput
              onChange={this.onValueChange}
              asCoin={true}
              maxValue={account.balance}
              value={coinToSell}
              fxRate={rate}
            />
            <Form.Input
              label="Recipient Email"
              id="email"
              name="email"
              onChange={this.onInputChanged}
              placeholder="An email address to send the e-Transfer to"
            />
            <Form.Input
              label="Security question"
              id="question"
              name="question"
              onChange={this.onInputChanged}
              placeholder="No numbers or special characters"
            />
            <Form.Input
              label="Security answer"
              id="answer"
              name="answer"
              onChange={this.onInputChanged}
              placeholder="No spaces or special characters"
            />
            <Form.Input
              label="Message (optional)"
              id="message"
              name="message"
              type="text"
              onChange={this.onInputChanged}
              placeholder="An optional message to the recipient.  Should not include the security answer"
            />
            <Form.Button onClick={this.onSubmit}>SEND</Form.Button>

            
            <Form.Input
              label="Name of you template"
              id="name"
              name="name"
              type="text"
              onChange={this.onInputChanged}
              placeholder="The name of the template you want to save"
            />

          <Dropdown
            fluid
            search
            selection
            allowAdditions
            options={options}
            onAddItem={this.handleAddTemplate}
            onChange={this.handleTemplateChange}
            placeholder='Template'
            disabled={isFetching}
            loading={isFetching}
          />

            <Form.Button onClick={async () => {await this.saveTemplate()} }>Save as Template</Form.Button>
            <Form.Button onClick={async () => {await this.loadTemplate()} }>Load Template</Form.Button>
          </Form>
          <ModalOperation
            cancelCallback={this.onCancelTransfer}
            isOpen={transferInProgress}
            header={messages.transferOutHeader}
            progressMessage={transferMessage}
            progressPercent={percentComplete}
            messageValues={transferValues}
          />
        </div>
      </React.Fragment>
    );
  }
}

export const Redeem = connect(selectFxRate)(RedeemClass);
