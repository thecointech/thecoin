import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { Button, ButtonProps } from "semantic-ui-react";
import styles from "./styles.module.less";

const Durations = {
  7: {
    id:"site.GraphHistoryButtons.Week",
    defaultMessage:"WEEK",
    description:"button for Duration of 1 week"
  },
  31: {
    id:"site.GraphHistoryButtons.Month",
    defaultMessage:"MONTH",
    description:"button for Duration of 1 month"
  },
  365: {
    id:"site.GraphHistoryButtons.Year",
    defaultMessage:"YEAR",
    description:"button for Duration of 1 year"
  },
  [Number.POSITIVE_INFINITY]: {
    id:"site.GraphHistoryButtons.All",
    defaultMessage:"ALL",
    description:"button for Show entire history"
  }
}
export type Duration = keyof typeof Durations;
export type GraphButtonsProps = {
  duration: Duration,
  setDuration: (duration: Duration) => void;
}

export const DurationButtons = (props: GraphButtonsProps) => {
  const onClick = useCallback((_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
    props.setDuration(parseInt(data.days) as Duration);
  }, []);
  return (
    <div id={styles.buttons}>
      {
        Object.entries(Durations).map(([days, message]) => (
          <GraphButton key={days} days={days} active={props.duration == parseInt(days)} onClick={onClick}>
            <FormattedMessage {...message} />
          </GraphButton>
        ))
      }
    </div>
  );
}

const GraphButton: React.FC<ButtonProps> = (props) =>
  <Button {...props} inverted className={styles.button} />
