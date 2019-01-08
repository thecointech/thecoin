import React from 'react';
import { debounce, Cancelable } from 'lodash';
import { Input } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Lock } from 'utils/icons';
import { Color } from 'csstype';

import styles from './index.module.css';
import messages, { scope as MessageScope } from './messages';
import { ZXCVBNResult } from 'zxcvbn';
import { UxInput } from 'components/UxInput';
import { ValidationResult } from 'components/UxInput/types';

const initialState = {
  message: undefined as FormattedMessage.MessageDescriptor | undefined,
  stats: null as ZXCVBNResult | null,
  isPassword: false,
  isValid: false,
  maskPassword: null,
  selectionStart: 0,
  selectionEnd: 0
}
type State = Readonly<typeof initialState>;

type ChangeCB = (value: string, score: number) => boolean;

const defaultProps = {
  infoBar: true,
  statusColor: "#5CE592",
  statusInactiveColor: "#FC6F6F",
  unMaskTime: 1400,
  as: Input,
  forceValidate: false
};
type DefaultProps = Readonly<typeof defaultProps>

interface RequiredProps {
  intlLabel: FormattedMessage.MessageDescriptor;
  uxChange: ChangeCB;
}
type Props = RequiredProps & DefaultProps;

const UnMasked = "text";
const Masked = "password";

export class UxPassword extends React.PureComponent<Props, State> {

  static defaultProps = defaultProps;
  state = initialState;

  // This is the link to the zxcvbn function that
  // does the actual password scoring
  static zxcvbn: Function | null = null;
  maskPassword: Function & Cancelable;

  constructor(props: Props) {
    super(props);

    // set debouncer for password
    this.maskPassword = debounce(this.addPasswordType, props.unMaskTime);
    this.uxChange = this.uxChange.bind(this);
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

  getMeterStyle(validColor: Color, invalidColor: Color) {
    const { isValid, stats } = this.state;
    var width = (stats) ? 24 * stats.score + 4 : 0;
    return {
      width: width + '%',
      opacity: UxPassword.zxcvbn ? width * .01 + .5 : 0,
      background: isValid ? validColor : invalidColor,
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

  uxChange(value: string): ValidationResult {

    this.toggleMask();

    const stats = this.getScore(value);
    const isValid = this.props.uxChange(value, stats ? stats.score : -1);

    // call uxChange prop passed from parent
    this.setState({
      isValid: isValid,
      //      selectionStart: selectionStart || 0,
      //      selectionEnd: selectionEnd || 0,
    });

    const returnValue: ValidationResult = {
      isValid: isValid,
      message: undefined,
      tooltip: undefined
    }
    if (stats != null) {
      if (value.length == 0) {
        returnValue.message = messages.PasswordRequired;
      }
      else if (stats.feedback.warning.length > 0) {
        returnValue.message = {
          id: `${MessageScope}.Warning`,
          defaultMessage: stats.feedback.warning
        }
      }    
      if (stats.feedback.suggestions.length > 0) {
        returnValue.tooltip = {
          id: `${MessageScope}.Tooltip`,
          defaultMessage: stats.feedback.suggestions[0]
        }
      }
    }
    return returnValue;
  }

  //
  //////////////////////////////////////////////////////////////////////////////
  toggleMask() {
    if (this.props.unMaskTime > 0) {
      // display password, then
      this.setState({
        isPassword: false
      });

      // debounce remasking password
      this.maskPassword();
    }
  }

  getScore(val: string): zxcvbn.ZXCVBNResult | null {
    const zxcvbn = UxPassword.zxcvbn;
    if (!zxcvbn) {
      return null;
    }
    const stats = zxcvbn(val) as zxcvbn.ZXCVBNResult;
    this.setState({
      stats: stats
    });
    return stats;
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
    const {
      intlLabel,
      uxChange,
      infoBar,
      statusColor,
      statusInactiveColor,
      unMaskTime,
      as,
      ...inputProps
    } = this.props;

    const { isPassword, stats } = this.state;

    if (infoBar) {
      const messageId = stats !== null ? stats.score : "default";
      const meterStyles = this.getMeterStyle(statusColor, statusInactiveColor)
      infoBarComponent = (
        <div className={styles.infoStyle}>
          <FontAwesomeIcon className={styles.iconStyle} icon={Lock} size='xs' />
          <span style={meterStyles} className={styles.meterStyle} />
          <span className={styles.strengthLangStyle}>
            <FormattedMessage {...messages[messageId]} />
          </span>
        </div>);
    }

    return (
      <UxInput
        type={isPassword ? Masked : UnMasked}
        intlLabel={intlLabel}
        uxChange={this.uxChange}
        footer={infoBarComponent}
        {...inputProps} 
        />
    )
  }
}
