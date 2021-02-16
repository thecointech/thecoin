import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { Button, ButtonProps } from "semantic-ui-react";
import styles from "./styles.module.less";

const Durations = {
  7: {
    id:"app.historyGraph.Week",
    defaultMessage:"Week",
    description:"button for Duration of 1 week"
  },
  31: {
    id:"app.historyGraph.Month",
    defaultMessage:"Month",
    description:"button for Duration of 1 month"
  },
  365: {
    id:"app.historyGraph.Year",
    defaultMessage:"Year",
    description:"button for Duration of 1 year"
  },
  0: {
    id:"app.historyGraph.All",
    defaultMessage:"All",
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
    props.setDuration(Number(data.days) as Duration);
  }, []);
  return (
    <div id={styles.buttons}>
      {
        Object.entries(Durations).map(([days, message]) => (
          <GraphButton key={days} days={days} active={props.duration === Number(days)} onClick={onClick}>
            <FormattedMessage {...message} />
          </GraphButton>
        ))
      }
    </div>
  );
}

const GraphButton: React.FC<ButtonProps> = (props) =>
  <Button {...props} inverted className={styles.button} />
