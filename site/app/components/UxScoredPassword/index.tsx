import React from 'react';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Lock } from 'utils/icons';
import { Color } from 'csstype';

import styles from './index.module.css';
import messages, { scope as MessageScope } from './messages';
import { ZXCVBNResult } from 'zxcvbn';
import { Props as MyProps } from './types';
import { UxPassword } from '@the-coin/components/components/UxPassword';

const initialState = {
  message: undefined as FormattedMessage.MessageDescriptor | undefined,
  tooltip: undefined as FormattedMessage.MessageDescriptor | undefined,
  stats: null as ZXCVBNResult | null,
}

const defaultProps = {
  infoBar: true,
  statusColor: "#5CE592",
  statusInactiveColor: "#FC6F6F",
};

type State = Readonly<typeof initialState>;
type Props = Readonly<MyProps>;
export class UxScoredPassword extends React.PureComponent<Props, State> {

  static defaultProps = defaultProps;
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
    const { stats } = this.state;
    const { isValid } = this.props;
    var width = (stats) ? 24 * stats.score + 4 : 0;
    return {
      width: width + '%',
      opacity: UxScoredPassword.zxcvbn ? width * .01 + .5 : 0,
      background: isValid ? validColor : invalidColor,
    }
  }

  /*==========  HANDLERS  ==========*/

  uxChange(value: string): void {

    const stats = this.getScore(value);
    const isValid = this.props.uxChange(value, stats ? stats.score : -1);

    if (stats !== null) {
      const hasWarning = stats.feedback.warning.length > 0;
      let newState = {
        tooltip: {
          id: `${MessageScope}.Tooltip`,
          defaultMessage: `This password requires ${stats.crack_times_display.offline_slow_hashing_1e4_per_second} to crack`
        }
      };
      if (hasWarning) {
        newState["message"] = {
          id: `${MessageScope}.Warning`,
          defaultMessage: stats.feedback.warning
        }
      }
      else {
        newState["message"] = isValid ?
          undefined : 
          messages.PasswordRequired;
      }

      this.setState(newState);
    }
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
    let infoBarComponent: React.ReactNode|undefined = undefined;
    const {
      intlLabel,
      uxChange,
      infoBar,
      statusColor,
      statusInactiveColor,
      ...inputProps
    } = this.props;
    const { stats, ...restState } = this.state;

    if (infoBar) {
      const messageId = stats !== null ? stats.score : "default";
      const meterStyles = this.getMeterStyle(statusColor!, statusInactiveColor!)
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
        intlLabel={intlLabel}
        uxChange={this.uxChange}
        footer={infoBarComponent}
        {...inputProps}
        {...restState}
      />
    )
  }
}
