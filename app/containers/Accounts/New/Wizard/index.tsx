import * as React from 'react';
import { Form, Header, Accordion, Icon } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
//import AnimateHeight from 'react-animate-height';
import { Slider } from "react-semantic-ui-range";

import messages from './messages';
import { HandHoldingUsd } from 'utils/icons';
import AnimateHeight from 'react-animate-height';
import styles from './index.module.css';
//import { HandHoldingUsd } from 'utils/icons';

const initialState = {
  activeAccordion: -1,

  // Options
  value: 1000 as 100 | 1000 | 10000 | 100000,
  techAbility: false,
  secureConv: 0.2,
  responsibility: false,

  // showDlg: false,
  // percentComplete: 0,
  // transferHeader: messages.getTransferCodeHeader,
  // transferMessage: messages.fetchTransferCode,
  // transferValues: undefined as any,
};

type StateType = Readonly<typeof initialState>;
type Props = {};

export class Wizard extends React.PureComponent<Props, StateType> {
  state = initialState;

  accordionClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeAccordion } = this.state;
    const newIndex = activeAccordion === index ? -1 : index;

    this.setState({ activeAccordion: newIndex });
  };

  handleChange = (e, { name, value }) =>
    this.setState({ [name]: value } as any);

  renderValueFormRadio = (value: number, current: number) => (
    <Form.Radio
      label={value}
      value={value}
      checked={value === current}
      onChange={this.handleChange}
    />
  );

  renderValueForm = () => (
      <Form>
        <Form.Group inline>
          <label>Less than:</label>
          {this.renderValueFormRadio(1000, this.state.value)}
          {this.renderValueFormRadio(10000, this.state.value)}
          {this.renderValueFormRadio(100000, this.state.value)}
        </Form.Group>
      </Form>
    );

  renderSecurityConvenienceForm = () => (
    <>
      <Slider value={this.state.secureConv} color="red" settings={{
        start: 3,
        min: 0,
        max: 5,
        step: 1,
        onChange: this.handleChange
    }} />
    </>
  )

  render() {
    const { activeAccordion } = this.state;
    const wizardOptions = [
      {
        icon: HandHoldingUsd,
        title: messages.valueHeader,
        message: messages.valueMessage,
        content: this.renderValueForm(),
      },
      {
        icon: HandHoldingUsd,
        title: messages.convenienceHeader,
        message: messages.convenienceMessage,
        content: this.renderSecurityConvenienceForm(),
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
          <Accordion
            fluid
            styled
            activeIndex={activeAccordion}
            onTitleClick={this.accordionClick}
            panels={wizardOptions.map((item, index) => ({
              key: index,
              title: (
                <Accordion.Title>
                  <div className={styles.HeaderContainer}>
                    <Icon name="dropdown" />
                    {item.title}
                    {item.icon}
                    <div style={{ clear: 'both' }} />
                  </div>
                </Accordion.Title>
              ),
              content: (AccordionContent, { key, active }) => (
                <div key={key}>
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
      </>
    );
  }
}
