import * as React from 'react';
import { Form, Header, Accordion, Icon, List, Button } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import AnimateHeight from 'react-animate-height';

import { DualFxInput } from '@the-coin/components/components/DualFxInput';
import { ContainerState } from '@the-coin/components/containers/FxRate/types';
import { selectFxRate } from '@the-coin/components/containers/FxRate/selectors';
import { weSellAt } from '@the-coin/components/containers/FxRate/reducer';
import { ModalOperation } from '@the-coin/components/containers/ModalOperation';
import { TheSigner } from '@the-coin/components/SignerIdent';

import { GetSignedMessage } from '@the-coin/utilities/lib/SignedMessages';
import { GetBuyApi } from '../../Services/BrokerCAD';
import messages from './messages';
import InteraceTransfer from './Interac-eTransfer.png';
import InteraceOnline from './Interac-Online.png';
import styles from './index.module.css';

type MyProps = {
  signer: TheSigner;
};

const initialState = {
  cadPurchase: null as number | null,
  activeAccordion: -1,

  // Transfer code vars
  showDlg: false,
  percentComplete: 0,
  transferHeader: messages.getTransferCodeHeader,
  transferMessage: messages.fetchTransferCode,
  transferValues: undefined as any,
};

type StateType = Readonly<typeof initialState>;
type Props = MyProps & ContainerState;

class PurchaseClass extends React.PureComponent<Props, StateType> {
  state = initialState;

  constructor(props: Props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.accordionClick = this.accordionClick.bind(this);
  }

  onSubmit(e: React.MouseEvent<HTMLElement>) {
    alert('NOT IMPLEMENTED');
  }

  onValueChange(value: number) {
    this.setState({
      cadPurchase: value,
    });
  }

  accordionClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeAccordion } = this.state;
    const newIndex = activeAccordion === index ? -1 : index;

    this.setState({ activeAccordion: newIndex });
  };

  onCloseDlg = () => this.setState({ showDlg: false });
  onGenerateRecipient = e => {
    this.generateRecipient();
  }

  async generateRecipient() {
    this.setState({
      showDlg: true,
      transferHeader: messages.getTransferCodeHeader,
      transferMessage: messages.fetchTransferCode,
      percentComplete: 0,
    });

    // Build our request
    const { signer } = this.props;
    const ts = `${Date.now()}`;
    const request = await GetSignedMessage(ts, signer);
    const api = GetBuyApi();
    const response = await api.eTransferCode(request);

    // Display to user
    const toAddress = `${signer.address}@thecoin.io`.toLowerCase();
    this.setState({
      transferHeader: messages.haveTransferCodeHeader,
      transferMessage: messages.yourTransferCode,
      transferValues: {
        recipient: <a href={`mailto:${toAddress}`}>{toAddress}</a>,
        secret: response.code
      },
      percentComplete: 1
    });
  }

  render() {
    const { rates } = this.props;
    const rate = weSellAt(rates);

    const { activeAccordion } = this.state;
    //const ImgeTransfer = <img src={InteraceTransfer} alt='logo' />
    const paymentMethods = [
      {
        logo: InteraceTransfer,
        title: 'Interac e-Transfer',
        content: (
          <List divided relaxed>
            <List.Item>Sign into your finacial institution</List.Item>
            <List.Item>
              Navigate to where you can send an Interac Email Transfer
            </List.Item>
            <List.Item>
              <Button onClick={this.onGenerateRecipient}>Generate</Button>
              your personalized e-Transfer recipient
            </List.Item>
            <List.Item>
              Create a new recipient in your financial institution with the
              given details
            </List.Item>
            <List.Item>
              Send the amount you wish to deposit. It will be credited to your
              account within 2 working days.
            </List.Item>
          </List>
        ),
      },
      {
        logo: InteraceOnline, //<img className={styles.LogoImage} src={InteraceOnline} alt='logo' />,
        title: 'Interac Online',
        content: <p>Direct payment via Interac Online is coming soon!</p>,
      },
    ];

    return (
      <>
        <Form>
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
            maxValue={3000}
            value={this.state.cadPurchase}
            fxRate={rate}
          />

          <Accordion
            fluid
            styled
            activeIndex={activeAccordion}
            onTitleClick={this.accordionClick}
            panels={paymentMethods.map((item, index) => ({
              key: index,
              title: (
                <Accordion.Title>
                  <div className={styles.HeaderContainer}>
                    <Icon name="dropdown" />
                    {item.title}
                    <img
                      src={item.logo}
                      className={styles.LogoImage}
                      alt="logo"
                    />
                    <div style={{ clear: 'both' }} />
                  </div>
                </Accordion.Title>
              ),
              content: (AccordionContent, { key, active }) => (
                <div key={key} className={styles.PaymentMethod}>
                  <AnimateHeight
                    animateOpacity
                    duration={300}
                    height={active ? 'auto' : 0}
                  >
                    {item.content}
                  </AnimateHeight>
                </div>
              ),
            }))}
          />
        </Form>
        <ModalOperation
          isOpen={this.state.showDlg}
          progressPercent={this.state.percentComplete}
          header={this.state.transferHeader}
          progressMessage={this.state.transferMessage}
          messageValues={this.state.transferValues}
          okCallback={this.onCloseDlg}
        />
      </>
    );
  }
}

export const Purchase = connect(selectFxRate)(PurchaseClass);
