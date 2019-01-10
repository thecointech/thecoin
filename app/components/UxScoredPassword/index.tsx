import React from 'react';
import { Input } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Lock } from 'utils/icons';
import { Color } from 'csstype';

import styles from './index.module.css';
import messages, { scope as MessageScope } from './messages';
import { ZXCVBNResult } from 'zxcvbn';
import { ValidationResult } from 'components/UxInput/types';
import { OptionalProps, RequiredProps } from './types';
import { UxPassword } from 'components/UxPassword';

const initialState = {
  message: undefined as FormattedMessage.MessageDescriptor | undefined,
  stats: null as ZXCVBNResult | null,
  isValid: false as boolean|undefined,
}

type State = Readonly<typeof initialState>;
type Props = Readonly<RequiredProps & OptionalProps>;
export class UxScoredPassword extends React.PureComponent<Props, State> {

  static defaultProps: OptionalProps = {
    infoBar: true,
    statusColor: "#5CE592",
    statusInactiveColor: "#FC6F6F",
    as: Input,
    forceValidate: false,
  };
  state = initialState;

  // This is the link to the zxcvbn function that
  // does the actual password scoring
  static zxcvbn: Function | null = null;

  constructor(props: Props) {
    super(props);

    // set debouncer for password
    this.uxChange = this.uxChange.bind(this);
    this.ensureZxcvbn();
  }

  async ensureZxcvbn() {
    if (UxScoredPassword.zxcvbn)
      return;

    try {
      UxScoredPassword.zxcvbn = (await import("./zxcvbn")).default;
    }
    catch (e) {
      console.error("Error loading PasswordVerifier: ", e);
    }
  }

  /*==========  STYLES  ==========*/

  getMeterStyle(validColor: Color, invalidColor: Color) {
    const { isValid, stats } = this.state;
    var width = (stats) ? 24 * stats.score + 4 : 0;
    return {
      width: width + '%',
      opacity: UxScoredPassword.zxcvbn ? width * .01 + .5 : 0,
      background: isValid ? validColor : invalidColor,
    }
  }

  /*==========  HANDLERS  ==========*/

  uxChange(value: string): ValidationResult {

    const stats = this.getScore(value);
    const returnValue = this.props.uxChange(value, stats ? stats.score : -1);

    // Validity required to set color property
    this.setState({
      isValid: returnValue.isValid,
    });

    if (stats != null) {
      const hasWarning = stats.feedback.warning.length > 0;
      if (hasWarning) {
        returnValue.message = {
          id: `${MessageScope}.Warning`,
          defaultMessage: stats.feedback.warning
        }
      }
      returnValue.tooltip = {
        id: `${MessageScope}.Tooltip`,
        defaultMessage: "This password could be cracked in:" + stats.crack_times_display.offline_slow_hashing_1e4_per_second
      }
    }
    return returnValue;
  }

  //
  //////////////////////////////////////////////////////////////////////////////

  getScore(val: string): zxcvbn.ZXCVBNResult | null {
    const zxcvbn = UxScoredPassword.zxcvbn;
    if (!zxcvbn) {
      return null;
    }
    const stats = zxcvbn(val) as zxcvbn.ZXCVBNResult;
    this.setState({
      stats: stats
    });
    return stats;
  }


  render() {
    let infoBarComponent;
    const {
      uxChange,
      infoBar,
      statusColor,
      statusInactiveColor,
      ...inputProps
    } = this.props;

    const { stats } = this.state;

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
      <UxPassword
        uxChange={this.uxChange}
        footer={infoBarComponent}
        {...inputProps}
      />
    )
  }
}
