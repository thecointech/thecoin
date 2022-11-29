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
  const [duration, setDuration] = useState(31 as Duration);

  const account = AccountMap.useActive();
  const txs = account?.history ?? [];
  const from = Number.isFinite(duration)
    ? DateTime.local().minus({days: duration})
    : undefined;

  const modifiers = account?.plugins
    .map(d => d.emulator?.balanceOf)
    .filter(isPresent)
    ?? [];

  return (
    <AppContainer className={styles.graphBackground}>
      <DurationButtons duration={duration} setDuration={setDuration} />
      <GraphTxHistory
        plugins={modifiers}
        txs={txs}
        from={from}
        theme={theme}
        height={275}
        tooltip={Tooltip}
      />
    </AppContainer>
  )
}
