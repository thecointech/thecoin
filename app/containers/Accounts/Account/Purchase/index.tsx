import * as React from 'react';
import { DualFxInput } from 'components/DualFxInput';
import { Form, Header, Accordion, Icon, List } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import { ContainerState } from 'containers/FxRate/types'
import { selectFxRate } from 'containers/FxRate/selectors'
import { connect } from 'react-redux';
import AnimateHeight from 'react-animate-height';
import messages from './messages';
import InteraceTransfer from './Interac-eTransfer.png';
import InteraceOnline from './Interac-Online.png';
import styles from './index.module.css';

type MyProps = {
  address: string
}

const initialState = {
  cadPurchase: undefined as number | undefined,
  activeAccordion: -1
}

type StateType = Readonly<typeof initialState>
type Props = MyProps & ContainerState

class PurchaseClass extends React.PureComponent<Props, StateType> {

  state = initialState;

  constructor(props: Props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.accordionClick = this.accordionClick.bind(this);
  }

  onSubmit(e: React.MouseEvent<HTMLElement>) {
    alert("NOT IMPLEMENTED");
  }

  onValueChange(value: number) {
    this.setState({
      cadPurchase: value
    })
  }

  accordionClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeAccordion } = this.state
    const newIndex = activeAccordion === index ? -1 : index

    this.setState({ activeAccordion: newIndex })
  }

  render() {
    const { sell, fxRate, address } = this.props;
    const rate = sell * fxRate;

    const { activeAccordion } = this.state;
    //const ImgeTransfer = <img src={InteraceTransfer} alt='logo' />
    const paymentMethods = [
      {
        logo: InteraceTransfer,
        title: "Interac e-Transfer",
        content: (
          <List divided relaxed>
            <List.Item>Sign into your finacial institution</List.Item>
            <List.Item>Navigate to where you can send an Interac Email Transfer</List.Item>
            <List.Item>Create a new recipient with your personal address: <a href={`mailto:${address}@thecoin.io`} >{address}@thecoin.io</a></List.Item>
            <List.Item>You may set the recipients question to be anything you like, but the answer must be "TheCoin" (without quotes).</List.Item>
            <List.Item>Send the amount you wish to deposit.  It will be credited to your account once processed.</List.Item>
          </List>
        )          
      },
      {
        logo: InteraceOnline, //<img className={styles.LogoImage} src={InteraceOnline} alt='logo' />,
        title: "Interac Online",
        content: <p>Direct payment via Interac Online is coming soon!</p>
      }
    ];

    return (
      <Form>
        <Header as="h1">
          <Header.Content>
            <FormattedMessage {...messages.header} />
          </Header.Content>
          <Header.Subheader>
            <FormattedMessage {...messages.subHeader} />
          </Header.Subheader>
        </Header>

        <DualFxInput onChange={this.onValueChange} maxValue={3000} value={this.state.cadPurchase} fxRate={rate} />

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
                  <Icon name='dropdown' />
                  {item.title}
                  <img src={item.logo} className={styles.LogoImage} alt='logo' />
                  <div style={{clear: "both"}} />
                </div>
                </Accordion.Title>
            ),
            content: (AccordionContent, { key, active }) => (
              <div key={key} className={styles.PaymentMethod}>
                <AnimateHeight animateOpacity duration={300} height={active ? 'auto' : 0}>
                  {item.content}
                </AnimateHeight>
              </div>
            )
          }))
          }
        />
      </Form>
    )
  }
}

export const Purchase = connect(selectFxRate)(PurchaseClass)