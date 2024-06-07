import React from "react";
import { AccountMap } from "@thecointech/shared/containers/AccountMap";
import { GraphTxHistory, Theme } from '@thecointech/shared/components/GraphTxHistory'
import { LessVars } from "@thecointech/site-semantic-theme/variables";
import { DateTime } from "luxon";
import styles from './styles.module.less';
import { Tooltip } from "./Tooltip/Tooltip";
import { DurationButtons } from "./DurationButtons";
import { AppContainer } from "components/AppContainers";
import { isPresent } from "@thecointech/utilities";

const theme: Theme = {
  fontSize: 10,
  textColor: "#FFF", // LessVar does not include built-in vars, unfortunately
  lineColors: [
    LessVars.theCoinPrimaryGreenNeutral,
    LessVars.theCoinPrimaryGreenPale
  ],
  dotColor: LessVars.theCoinPrimaryGreenNeutral,
  // axis: {
  //   domain: {
  //     line: {
  //       stroke: 'blue',
  //       strokeWidth: 2,
  //     }
  //   }
  // }
};

type DateTimeState = [DateTime, (v: DateTime) => void];
type Props = {
  fromDate: DateTimeState,
  toDate: DateTimeState,
}

export const HistoryGraph = (props: Props) => {

  const account = AccountMap.useActive();
  const txs = account?.history ?? [];

  const modifiers = account?.plugins
    .map(d => d.emulator)
    .filter(isPresent)
    ?? [];

  const fromDate = DateTime.max(props.fromDate[0], txs[0]?.date ?? DateTime.now().minus({month: 1}))

  return (
    <AppContainer className={styles.graphBackground}>
      <DurationButtons {...props} />
      <GraphTxHistory
        plugins={modifiers}
        txs={txs}
        from={fromDate}
        to={props.toDate[0]}
        theme={theme}
        height={275}
        tooltip={Tooltip}
      />
    </AppContainer>
  )
}
