import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Icon } from 'semantic-ui-react';
import styles from './styles.module.less';

const translate = defineMessages({
  default: {defaultMessage: 'strength', description: "Password complexity indicator" },
  0: {defaultMessage: 'ineffectual', description: "Password complexity indicator" },
  1: {defaultMessage: 'vulnerable', description: "Password complexity indicator" },
  2: {defaultMessage: 'weak', description: "Password complexity indicator" },
  3: {defaultMessage: 'moderate', description: "Password complexity indicator" },
  4: {defaultMessage: 'strong', description: "Password complexity indicator" },
});

type Props = {
  score?: 0|1|2|3|4,
  valid: boolean,
}

export const StrengthBar = (props: Props) => {
  const meterStyles = getMeterStyle(props)
  return (
    <div className={styles.infoStyle}>
      <Icon className={styles.iconStyle} type="lock" size="small" />
      <span style={meterStyles} className={styles.meterStyle} />
      <span className={styles.strengthLangStyle}>
        <FormattedMessage {...(translate[props.score ?? "default"])} />
      </span>
    </div>);
}

function getMeterStyle({ score, valid }: Props) {
  var width = (score !== undefined) ? 24 * score + 4 : 0;
  return {
    width: width + '%',
    opacity: width * .01 + .5,
    background: valid ? "#5CE592" : "#FC6F6F",
  }
}
