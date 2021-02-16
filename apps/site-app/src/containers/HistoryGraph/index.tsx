import React, { useState } from "react";
import { useActiveAccount } from "@the-coin/shared/containers/AccountMap/selectors";
import { Container } from "semantic-ui-react";
import { GraphTxHistory, Theme } from '@the-coin/shared/components/GraphTxHistory'
import { LessVars } from "@the-coin/site-base/styles/variables";
import { DateTime } from "luxon";
import styles from './styles.module.less';
import { Tooltip } from "./Tooltip";
import { Duration, DurationButtons } from "./DurationButtons";

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

  const account = useActiveAccount();
  const txs = account?.history ?? [];
  const from = duration
    ? DateTime.local().minus({days: duration})
    : undefined;

  return (
    <Container className={styles.graphBackground}>
      <DurationButtons duration={duration} setDuration={setDuration} />
      <GraphTxHistory
        txs={txs}
        from={from}
        theme={theme}
        height={275}
        tooltip={Tooltip}
      />
    </Container>
  )
}
