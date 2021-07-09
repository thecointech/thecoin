import React from 'react';
import { MessageDescriptor, FormattedMessage, defineMessages } from 'react-intl';
import { Color } from 'csstype';
import { Icon } from 'semantic-ui-react';
import styles from './styles.module.less';
import type { ZXCVBNResult } from 'zxcvbn';
import { Props as MyProps } from './types';
import { UxPassword } from '@thecointech/shared/components/UxPassword';

const initialState = {
  message: undefined as MessageDescriptor | undefined,
  tooltip: undefined as MessageDescriptor | undefined,
  stats: null as ZXCVBNResult | null,
}

const defaultProps = {
  infoBar: true,
  statusColor: "#5CE592",
  statusInactiveColor: "#FC6F6F",
};

type State = Readonly<typeof initialState>;
type Props = Readonly<MyProps>;

const translate = defineMessages({
  default: {
    id: "base.uxScoredPassword.strength",
    defaultMessage: 'strength',
  },
  0: {
    id: "base.uxScoredPassword.ineffectual",
    defaultMessage: 'ineffectual',
  },
  1: {
    id: "base.uxScoredPassword.vulnerable",
    defaultMessage: 'vulnerable',
  },
  2: {
    id: "base.uxScoredPassword.weak",
    defaultMessage: 'weak',
  },
  3: {
    id: "base.uxScoredPassword.moderate",
    defaultMessage: 'moderate',
  },
  4: {
    id: "base.uxScoredPassword.strong",
    defaultMessage: 'strong',
  },
  PasswordRequired: {
    id: "base.uxScoredPassword.PasswordRequired",
    defaultMessage: "Please enter a password of at least 'moderate' strength",
  },
});

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
      UxScoredPassword.zxcvbn = (await import("zxcvbn")).default;
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
          defaultMessage: `This password requires ${stats.crack_times_display.offline_slow_hashing_1e4_per_second} to crack`
        },
        message: hasWarning
          ? {
              defaultMessage: stats.feedback.warning
            }
          : isValid
            ? undefined
            : translate.PasswordRequired
      };
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
          <Icon className={styles.iconStyle} type="lock" size="small" />
          <span style={meterStyles} className={styles.meterStyle} />
          <span className={styles.strengthLangStyle}>
            <FormattedMessage {...translate[messageId]} />
          </span>
        </div>);
    }

    return (
      <UxPassword
        intlLabel={intlLabel}
        id="uxPasswordField"
        uxChange={this.uxChange}
        footer={infoBarComponent}
        {...inputProps}
        {...restState}
      />
    )
  }
}
