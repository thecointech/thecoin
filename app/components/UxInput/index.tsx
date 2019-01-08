import React, { ReactNode } from 'react';
import { Form, Label, Input, Message, InputProps } from 'semantic-ui-react';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import cx from 'classnames';
import styles from './index.module.css';

const initialState = {
  value: '',
  showState: false,
  isValid: false,
  message: undefined as undefined | FormattedMessage.MessageDescriptor,
  tooltip: undefined as undefined | FormattedMessage.MessageDescriptor,
};
export type ValidationResult = {
  isValid: boolean;
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

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (nextProps.forceValidate && !this.props.forceValidate) {
      const results = this.props.uxChange(nextState.value);
      Object.assign(nextState, results);
    }
    return true;
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
      ...results,
    });
    event.currentTarget.focus();
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

    const show = showState || forceValidate;
    const errorTag = show && !isValid;
    const successTag = show && isValid;
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

    // const tooltipElement = tooltip ? (
    //   <div
    //     className="ui"
    //     data-tooltip="Add users to your feed"
    //     data-position="top center"
    //   >
    //     <FormattedMessage {...tooltip} />
    //   </div>
    // ) : (
    //   // <Popup basic on="hover" key={intlLabel.id} size="small" hidd>
    //   // </Popup>
    //   undefined
    // );

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
