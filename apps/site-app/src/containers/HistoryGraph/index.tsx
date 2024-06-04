import React, { useState } from "react";
import { AccountMap } from "@thecointech/shared/containers/AccountMap";
import { GraphTxHistory, Theme } from '@thecointech/shared/components/GraphTxHistory'
import { LessVars } from "@thecointech/site-semantic-theme/variables";
import { DateTime } from "luxon";
import styles from './styles.module.less';
import { Tooltip } from "./Tooltip/Tooltip";
import { Duration, DurationButtons } from "./DurationButtons";
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

export const HistoryGraph = () => {
  const [duration, setDuration] = useState(Number.POSITIVE_INFINITY as Duration);

  const account = AccountMap.useActive();
  const txs = account?.history ?? [];
  // const to = DateTime.fromObject({
  //   year: 2023,
  //   month: 5,
  //   day: 1
  // })
  const to = DateTime.local();
  const from = Number.isFinite(duration)
    ? to.minus({days: duration})
    : undefined;

  const modifiers = account?.plugins
    .map(d => d.emulator)
    .filter(isPresent)
    ?? [];

  return (
    <AppContainer className={styles.graphBackground}>
      <DurationButtons duration={duration} setDuration={setDuration} />
      <GraphTxHistory
        plugins={modifiers}
        txs={txs}
        from={from}
        to={to}
        theme={theme}
        height={275}
        tooltip={Tooltip}
      />
    </AppContainer>
  )
}
