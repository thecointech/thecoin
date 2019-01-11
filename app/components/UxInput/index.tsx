import React from 'react';
import { Form, Label, Input, Message, InputProps } from 'semantic-ui-react';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import cx from 'classnames';
import styles from './index.module.css';
import { RequiredProps, OptionalProps } from './types';

const initialState = {
  value: '',
  showState: false,
  isValid: false as undefined | boolean,
  message: undefined as undefined | FormattedMessage.MessageDescriptor,
  tooltip: undefined as undefined | FormattedMessage.MessageDescriptor,
};
type State = Readonly<typeof initialState>;

type Props = RequiredProps &
  OptionalProps &
  Partial<InputProps> &
  InjectedIntlProps;

class UxInputClass extends React.Component<Props, State> {
  state = initialState;

  static defaultProps: OptionalProps = {
    forceValidate: false,
  };

  constructor(props: Props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  //
  // Ensure that if we recieve the forceValidate prop, we validate
  // our current value and show the result (regardless of state)
  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (nextProps.forceValidate && !prevState.showState) {
      const results = nextProps.uxChange(prevState.value);
      return {
        ...results,
        showState: true,
      };
    }
    return null;
  }

  onBlur(event: React.FocusEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;
    this.setState({
      showState: value.length > 0,
    });
  }

  onChange(event: React.FormEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;
    const results = this.props.uxChange(value);
    this.setState({
      value,
      isValid: results.isValid,
      message: results.message,
      tooltip: results.tooltip,
    });
  }

  render() {
    const { isValid, value, message, tooltip } = this.state;
    const {
      intl,
      intlLabel,
      forceValidate,
      footer,
      uxChange,
      ...inputProps
    } = this.props;

    const show = message !== undefined;
    const errorTag = isValid === false;
    const successTag = isValid === true;
    const formClassName = successTag ? 'success' : undefined;

    const tooltipData = tooltip ? intl.formatMessage(tooltip) : undefined;
    const inputElement = (
      <Input
        onChange={this.onChange}
        onBlur={this.onBlur}
        value={value}
        {...inputProps}
        data-tooltip={tooltipData}
      />
    );
    const messageElement = (
      <Message
        success={successTag}
        error={errorTag}
        hidden={!show}
        attached="bottom"
        className={cx(
          styles.ui,
          styles.attached,
          styles.bottom,
          styles.message,
          styles.inputMessage,
        )}
      >
        {message ? <FormattedMessage {...message} /> : undefined}
      </Message>
    );

    return (
      <Form.Field className={formClassName} error={errorTag}>
        <Label>
          <FormattedMessage {...this.props.intlLabel} />
        </Label>
        {inputElement}
        {messageElement}
        {footer}
      </Form.Field>
    );
  }
}

export const UxInput = injectIntl(UxInputClass);
