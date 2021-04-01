import React from 'react';
import { Form, Label, Input, Message } from 'semantic-ui-react';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import styles from './styles.module.less';
import { Props as MyProps, initialState } from './types';

type State = Readonly<typeof initialState>;
type Props = Readonly<MyProps & WrappedComponentProps>;

class UxInputClass extends React.Component<Props, State> {
  state = initialState;

  static defaultProps = {
    forceValidate: false
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
      nextProps.uxChange(prevState.value);
      return {
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
    this.props.uxChange(value);
    this.setState({
      value,
    });
  }

  render() {
    const { value, showState } = this.state;
    const {
      intl,
      intlLabel,
      uxChange,
      forceValidate,
      footer,
      isValid,
      message,
      messageValues,
      tooltip,
      ...inputProps
    } = this.props;

    const errorTag = showState && (isValid === false);
    const successTag = showState && (isValid === true);
    const formClassName = successTag ? 'success' : undefined;
    const showMessage = showState && (message != undefined);

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
        hidden={!showMessage}
        attached="top"
        className={`
          ${styles.ui}
          ${styles.attached}
          ${styles.bottom}
          ${styles.message}
          ${styles.inputMessage}
        `}
      >
        {message ? <FormattedMessage {...message} /> : undefined}
      </Message>
    );

    return (
      <Form.Field className={formClassName} error={errorTag}>
        <Label>
          <FormattedMessage {...this.props.intlLabel} />
        </Label>
        {messageElement}
        {inputElement}
        {footer}
      </Form.Field>
    );
  }
}

export const UxInput = injectIntl(UxInputClass);
