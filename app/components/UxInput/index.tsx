import React, { ReactNode } from 'react';
import { Form, Label, Input, Message, InputProps } from 'semantic-ui-react';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import cx from 'classnames';
import styles from './index.module.css';

const initialState = {
  value: '',
  showState: false,
  isValid: false as undefined | boolean,
  message: undefined as undefined | FormattedMessage.MessageDescriptor,
  tooltip: undefined as undefined | FormattedMessage.MessageDescriptor,
};
export type ValidationResult = {
  isValid: boolean | undefined;
  message: FormattedMessage.MessageDescriptor | undefined;
  tooltip: FormattedMessage.MessageDescriptor | undefined;
};
export type ChangeCB = (value: string) => ValidationResult;

export interface RequiredProps {
  readonly intlLabel: FormattedMessage.MessageDescriptor;
  readonly uxChange: ChangeCB;
  readonly footer?: ReactNode;
}

const optionalProps = {
  forceValidate: false,
};

type State = Readonly<typeof initialState>;
type Props = RequiredProps &
  Readonly<typeof optionalProps> &
  Partial<InputProps> &
  InjectedIntlProps;

class UxInputClass extends React.Component<Props, State> {
  state = initialState;

  static defaultProps = optionalProps;

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
    const { showState, isValid, value, message, tooltip } = this.state;
    const {
      intl,
      intlLabel,
      forceValidate,
      footer,
      uxChange,
      ...inputProps
    } = this.props;

    if (message) console.log(`${message.defaultMessage}`);

    const show = isValid !== undefined && (showState || forceValidate);
    const errorTag = show && isValid === false;
    const successTag = show && isValid === true;
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
        hidden={errorTag != true}
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
