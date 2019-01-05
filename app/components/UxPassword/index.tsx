import React from 'react';
import { debounce, Cancelable } from 'lodash';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { Container } from 'semantic-ui-react';
// import { FormattedMessage } from 'react-intl';
// import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Input, InputOnChangeData } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Lock } from 'utils/icons';
import { Color } from 'csstype';

import styles from './index.module.css';
import messages from './messages';
import {ZXCVBNResult} from 'zxcvbn';

type OnChangeCB = (value: string, isValid: boolean) => void

interface OwnProps {
  onChange: OnChangeCB;
  infoBar: true;
  statusColor: Color;
  statusInactiveColor: Color;
  minScore: number;
  minLength: number;
  unMaskTime: number,
  id: string,
  as: React.ReactChild
}

const initialState = {
  value: '',
  stats: null as ZXCVBNResult|null,
  isPassword: true,
  isValid: false,
  maskPassword: null,
  selectionStart: 0,
  selectionEnd: 0
}

type State = Readonly<typeof initialState>;

export class UxPassword extends React.PureComponent<OwnProps, State> {

  static defaultProps = {
    infoBar: true,
    statusColor: "#5CE592",
    statusInactiveColor: "#FC6F6F",
    minScore: 2,
    minLength: 0,
    unMaskTime: 1400,
    id: "input",
    as: Input
  };

  state = initialState;

  // This is the link to the zxcvbn function that
  // does the actual password scoring
  static zxcvbn: Function | null = null;
  maskPassword: Function & Cancelable;

  constructor(props: OwnProps) {
    super(props);

    // set debouncer for password
    this.maskPassword = debounce(this.addPasswordType, props.unMaskTime);
    this.handleChange = this.handleChange.bind(this);
    this.ensureZxcvbn();
  }

  async ensureZxcvbn() {
    if (UxPassword.zxcvbn)
      return;

    try {
      UxPassword.zxcvbn = (await import("./zxcvbn")).default;
    }
    catch (e) {
      console.error("Error loading PasswordVerifier: ", e);
    }
  }

  componentDidMount() {
    const { unMaskTime } = this.props;
    if (unMaskTime > 0) {
      this.maskPassword = debounce(this.addPasswordType, unMaskTime);
    }
  }

  /*==========  STYLES  ==========*/

  getMeterStyle() {
    const { value, isValid, stats } = this.state;
    const { statusColor, statusInactiveColor } = this.props;
    var width = (value && stats) ? 24 * stats.score + 4 : 0;
    return {
      width: width + '%',
      opacity: UxPassword.zxcvbn ? width * .01 + .5 : 0,
      background: isValid ? statusColor : statusInactiveColor,
    }
  }

  /*==========  METHODS  ==========*/

  addPasswordType() {
    this.setState({
      isPassword: true
    });
  }

  /*==========  HANDLERS  ==========*/

  handleInputType() {
    this.setState({
      isPassword: !this.state.isPassword
    });
  }

  handleChange(e: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) {
    e.preventDefault();

    const { value, selectionStart, selectionEnd } = e.currentTarget;
    const { onChange } = this.props;

    this.setState({
      value: value,
      selectionStart: selectionStart || 0,
      selectionEnd: selectionEnd || 0,
    });

    this.handleToggleMask();
    const isValid = this.handleValidity(value);

    // call onChange prop passed from parent
    if (onChange != undefined) {
      onChange(value, isValid);
    }
  }

  //
  //////////////////////////////////////////////////////////////////////////////
  handleToggleMask() {
    if (this.props.unMaskTime > 0)
    {
      // display password, then
      this.setState({
        isPassword: false
      });

      // debounce remasking password
      this.maskPassword();
    }
  }

  handleValidity(val: string): boolean {
    const { minLength, minScore} = this.props;
    let isValid = val.length >= minLength;

    const zxcvbn = UxPassword.zxcvbn;
    if (!zxcvbn) {
      return isValid;
    }

    const stats = zxcvbn(val) as zxcvbn.ZXCVBNResult;
    const { score } = stats;
    isValid = isValid && minScore <= score;

    this.setState({
      isValid: isValid,
      stats: stats
    });
    return isValid;
  }

  handleMinLength(len: number) {
    if (len <= this.props.minLength) {
      this.setState({
        isValid: false
      })
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
    let infoBarComponent;
    const { infoBar } = this.props;
    const { stats } = this.state;

    if (infoBar) {
      const messageId = stats !== null ? stats.score : "default";
      const meterStyles = this.getMeterStyle()
      infoBarComponent = (
        <div className={styles.infoStyle}>
          <FontAwesomeIcon className={styles.iconStyle} icon={Lock} size='xs' />
          <span style={meterStyles} className={styles.meterStyle} />
          <span className={styles.strengthLangStyle}>
            <FormattedMessage {...messages[messageId]} />
          </span>
        </div>);
    }

    // allow onChange to be passed from parent and not override default prop

    // overcome problem with firefox resetting the input selection point
    // TODO
    // var that = this;
    // if (typeof navigator !== 'undefined') {
    //   setTimeout(function () {
    //     if (!/Firefox/.test(navigator.userAgent)) return;
    //     var elem = that.refs[that.props.id].gte;
    //     elem.selectionStart = that.state.selectionStart;
    //     elem.selectionEnd = that.state.selectionEnd;
    //   }, 1);
    // }

    return (
      <React.Fragment>
        <Input
          ref={this.props.id}
          type={this.state.isPassword ? 'password' : 'text'}
          value={this.state.value}
          className={this.state.isPassword ? undefined : styles.unMaskStyle}
          onChange={this.handleChange}
          placeholder="Account Password"
        />
        {infoBarComponent}
      </React.Fragment>
    );
  }
}
