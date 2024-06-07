import React, { useCallback } from "react";
import { defineMessages, FormattedMessage } from "react-intl";
import { Button, ButtonProps } from "semantic-ui-react";
import { DateTime } from 'luxon';
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
type DateTimeState = [DateTime, (v: DateTime) => void];
export type GraphButtonsProps = {
  fromDate: DateTimeState,
  toDate: DateTimeState,
}

export const DurationButtons = (props: GraphButtonsProps) => {

  const onClick = useCallback((_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
    const duration = Number(data.days)
    const to = DateTime.local();
    props.toDate[1](DateTime.local())
    props.fromDate[1](
      Number.isFinite(duration)
        ? to.minus({days: duration})
        : DateTime.fromMillis(0)
    )
  }, []);

  const duration = getDuration(props.fromDate[0], props.toDate[0]);

  return (
    <div id={styles.buttons}>
      {
        Object.entries(Durations).map(([days, message]) => (
          <GraphButton key={days} days={days} active={duration === Number(days)} onClick={onClick}>
            <FormattedMessage {...message} />
          </GraphButton>
        ))
      }
    </div>
  );
}

const GraphButton: React.FC<ButtonProps> = (props) =>
  <Button {...props} inverted className={styles.button} />

function getDuration(from: DateTime, to: DateTime) {
  // If not ending today, does not match
  if (to.diffNow().as("days") > 1) {
    return null;
  }

  // DateTime(0) is infinite
  if (from.equals(DateTime.fromMillis(0))) {
    return Number.POSITIVE_INFINITY;
  }
  const diff = to.diff(from);
  return Math.round(diff.as("days"));
}