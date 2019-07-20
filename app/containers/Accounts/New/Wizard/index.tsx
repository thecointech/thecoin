import * as React from 'react';
import { Form, Header, Accordion } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import messages from './messages';
import { HandHoldingUsd } from 'utils/icons';
import AnimateHeight from 'react-animate-height';
import styles from './index.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getRecommendations } from './Options';
import { CreateOptionDlg } from './CreateOptionDlg';
import { ValueLimits, Accessible, Option } from './Options/Types';

const initialState = {
  activeAccordion: 0,

  // Options
  value: undefined as ValueLimits|undefined,
  installExtn: false,
  installAppn: false,
  accessible: undefined as Accessible,

  selectedOption: null as null|Option
};



type State = Readonly<typeof initialState>;
type StateKeys = keyof State;
type Props = {};

export class Wizard extends React.PureComponent<Props> {
  state = initialState;

  accordionClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeAccordion } = this.state;
    const newIndex = activeAccordion === index ? -1 : index;

    this.setState({ activeAccordion: newIndex });
  };

  handleChange = (e, args: { name: StateKeys, value: any }) =>
    this.setState((prevState: State) => { 
      return {
        activeAccordion: prevState.activeAccordion + 1, 
        [args.name]: args.value 
      } as any;
    });

  handleChangeCB = (e, args: { name: StateKeys, checked: boolean }) =>
    this.setState({[args.name]: args.checked} );

  onSetStorage = (e: React.MouseEvent<HTMLButtonElement>, option: Option) => {
    e.preventDefault();
    this.setState({selectedOption: option})
  }

  onCancelSetState = () => 
    this.setState({selectedOption: null})

  ////////////////////////////////////////////

  renderFormRadio = (label: string, name: string, value: any) => (
    <Form.Radio
      label={label}
      value={value}
      name={name}
      checked={value === this.state[name]}
      onChange={this.handleChange}
    />
  );

  renderValueFormRadio = (value: number, current: ValueLimits|undefined) => (
    <Form.Radio
      label={value}
      value={value}
      name="value"
      checked={value === current}
      onChange={this.handleChange}
    />
  );

  renderValueForm = () => (
        <Form.Group inline>
          <label>Less than:</label>
          {this.renderValueFormRadio(1000, this.state.value)}
          {this.renderValueFormRadio(10000, this.state.value)}
          {this.renderValueFormRadio(100000, this.state.value)}
          {this.renderFormRadio("No Limit", "value", 0)}
        </Form.Group>
    );

  renderTechChoiceForm = () => (
    <Form.Group inline>
      <Form.Checkbox name="installExtn" onChange={this.handleChangeCB} label='Installing Browser Extensions' />
      <Form.Checkbox name="installAppn" onChange={this.handleChangeCB} label='Using Opera Browser' />
      <Form.Button onClick={this.handleChange}>NEXT</Form.Button>
    </Form.Group>
  );

  // renderConvencienceChoice = () => (
  //   <>
  //     <Form.Group inline>
  //       <Form.Radio
  //         label="Security"
  //         name="preferSecurity"
  //         value="security"
  //         checked={this.state.prefer === "security"}
  //         onChange={this.handleChange}
  //       />
  //       <Form.Radio
  //         label="Convenience"
  //         name="preferSecurity"
  //         value="convenience"
  //         checked={this.state.prefer === "convenience"}
  //         onChange={this.handleChange}
  //       />
  //     </Form.Group>
  //   </>
  // )

  renderAccessibilityChoice = () => (
    <>
      <Form.Group inline>
        {this.renderFormRadio("Restrict access to my personal device", "accessible", "false")}
        {this.renderFormRadio("I want access from any device", "accessible", "true")}
      </Form.Group>
    </>
  )

  renderRecommendationForm = () => (
    getRecommendations(this.state).map(rec => {
      return <Form.Button key={rec.name} onClick={(e) => this.onSetStorage(e, rec)}>{rec.name}</Form.Button>
    })
  )

  ///////////////////////////////////////////////////////////////////


  render() {
    const { activeAccordion } = this.state;
    const choices = [
      {
        icon: HandHoldingUsd,
        title: messages.valueHeader,
        message: messages.valueMessage,
        content: this.renderValueForm(),
      },
      {
        icon: HandHoldingUsd,
        title: messages.techChoiceHeader,
        message: messages.techChoiceMessage,
        content: this.renderTechChoiceForm(),
      },
      // {
      //   icon: HandHoldingUsd,
      //   title: messages.convenienceHeader,
      //   message: messages.convenienceMessage,
      //   content: this.renderConvencienceChoice(),
      // },
      {
        icon: HandHoldingUsd,
        title: messages.accessibilityHeader,
        message: messages.accessibilityMessage,
        content: this.renderAccessibilityChoice(),
      },
      {
        icon: HandHoldingUsd,
        title: messages.recommendHeader,
        message: messages.recommendMessage,
        content: this.renderRecommendationForm(),
      }
    ];

    const actionDlg = this.state.selectedOption ? 
      <CreateOptionDlg onCancel={this.onCancelSetState} option={this.state.selectedOption} /> :
      undefined;

    return (
      <>
        <Header as="h1">
          <Header.Content>
            <FormattedMessage {...messages.header} />
          </Header.Content>
          <Header.Subheader>
            <FormattedMessage {...messages.subHeader} />
          </Header.Subheader>
        </Header>
        <Form>
          <Accordion
            fluid
            styled
            activeIndex={activeAccordion}
            onTitleClick={this.accordionClick}
            panels={choices.map((item, index) => ({
              key: index,
              title: (
                <Accordion.Title>
                  <div className={styles.HeaderContainer}>
                    <FontAwesomeIcon icon={item.icon} />
                    <FormattedMessage {...item.title} />
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
                    <FormattedMessage {...item.message} />
                    {item.content}
                  </AnimateHeight>
                </div>
              ),
            }))}
          />
        </Form>
        {actionDlg}
      </>
    );
  }
}
