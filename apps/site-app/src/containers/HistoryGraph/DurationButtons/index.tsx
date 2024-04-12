import React, { useCallback } from "react";
import { defineMessages, FormattedMessage } from "react-intl";
import { Button, ButtonProps } from "semantic-ui-react";
import styles from "./styles.module.less";

const translations = defineMessages({
  seven : {
      defaultMessage: 'Week',
      description: 'app.historyGraph.Week: button for Duration of 1 week'},
  thirtyOne : {
      defaultMessage: 'Month',
      description: 'app.historyGraph.Month: button for Duration of 1 month'},
  year : {
      defaultMessage: 'Year',
      description: 'app.historyGraph.Year: button for Duration of 1 year'},
  all : {
      defaultMessage: 'All',
      description: 'app.historyGraph.All: button for Show entire history'}
});

const Durations = {
  7: translations.seven,
  31: translations.thirtyOne,
  365: translations.year,
  [Number.POSITIVE_INFINITY]: translations.all,
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
