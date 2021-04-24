import React from 'react';
import { debounce, Cancelable } from 'lodash';
import { Container, Icon } from 'semantic-ui-react';
import { UxInput } from '../../components/UxInput';
import { Props, State, initialState } from './types';
import styles from './styles.module.less';

const UnMasked = "text";
const Masked = "password";
const hideStyle = {
  display: 'none',
} as React.CSSProperties;
const showStyle = {
  display: 'block',
} as React.CSSProperties;

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
    this.toggleMask = this.toggleMask.bind(this);
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

  uxChange(event: React.FormEvent<HTMLInputElement>): void {
    const returnValue = this.props.uxChange(event);
    return returnValue;
  }

  //
  //////////////////////////////////////////////////////////////////////////////
  toggleMask() {
    this.setState({
      isPassword: !this.state.isPassword
    });
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
      toggleMask,
      ...inputProps
    } = this.props;

    const { isPassword } = this.state;

    return (
      <Container id={styles.containerPasswordField}>
        <div onClick={this.toggleMask} id={styles.togglePassword} unselectable="on">
          <p style={ isPassword ? showStyle : hideStyle }><Icon name='hide' />&nbsp;Show Password</p>
          <p style={ isPassword ? hideStyle : showStyle }><Icon name='unhide' />&nbsp;Hide Password</p>
        </div>
        <UxInput
          type={isPassword ? Masked : UnMasked}
          uxChange={this.uxChange}
          {...inputProps}
        />
      </Container>
    )
  }
}
