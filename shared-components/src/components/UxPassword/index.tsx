import React from 'react';
import { debounce, Cancelable } from 'lodash';
import { FormattedMessage } from 'react-intl';

import { UxInput } from '../../components/UxInput';
import { Props } from './types';

const initialState = {
  message: undefined as FormattedMessage.MessageDescriptor | undefined,
  isPassword: false,
  maskPassword: null,
  selectionStart: 0,
  selectionEnd: 0
}
type State = Readonly<typeof initialState>;

const UnMasked = "text";
const Masked = "password";

export class UxPassword extends React.PureComponent<Props, State> {

  // Set default
  static defaultProps = {
    unMaskTime: 1400
  };
  state = initialState;

  // callback to trigger toggling password masking
  maskPassword: Function & Cancelable;

  constructor(props: Props) {
    super(props);

    // set debouncer for password
    this.maskPassword = debounce(this.addPasswordType, props.unMaskTime);
    this.uxChange = this.uxChange.bind(this);
  }

  componentDidMount() {
    const { unMaskTime } = this.props;
    if (unMaskTime! > 0) {
      this.maskPassword = debounce(this.addPasswordType, unMaskTime);
    }
  }

  /*==========  METHODS  ==========*/

  addPasswordType() {
    this.setState({
      isPassword: true
    });
  }

  /*==========  HANDLERS  ==========*/

  onToggleInputType() {
    this.setState({
      isPassword: !this.state.isPassword
    });
  }

  uxChange(value: string): void {
    this.toggleMask();
    const returnValue = this.props.uxChange(value);
    return returnValue;
  }

  //
  //////////////////////////////////////////////////////////////////////////////
  toggleMask() {
    const { unMaskTime } = this.props;
    if (unMaskTime! > 0) {
      // display password, then
      this.setState({
        isPassword: false
      });

      // debounce remasking password
      this.maskPassword();
    }
  }

  componentWillUnmount() {
    // cancel the debouncer when component is not used anymore. This to avoid
    // setting the state  unnecessarily, see issue #24
    if (this.maskPassword) {
      this.maskPassword.cancel()
    }
  }

  render() {    
    const {
      uxChange,
      unMaskTime,
      ...inputProps
    } = this.props;

    const { isPassword } = this.state;

    return (
      <UxInput
        type={isPassword ? Masked : UnMasked}
        uxChange={this.uxChange}
        {...inputProps}
      />
    )
  }
}
