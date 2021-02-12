import React from "react";
import { useActiveAccount } from "@the-coin/shared/containers/AccountMap/selectors";
import { Button, Container } from "semantic-ui-react";
import { GraphTxHistory, Theme } from '@the-coin/shared/components/GraphTxHistory'
import { LessVars } from "@the-coin/site-base/styles/variables";
import { DateTime } from "luxon";
import styles from './styles.module.less';

const theme: Theme = {
  fontSize: 10,
  textColor: "#FFF" // LessVar does not include built-in vars, unfortunately
};

export const HistoryGraph = () => {
  const account = useActiveAccount();
  const txs = account?.history ?? [];

  const lineColor = LessVars.theCoinPrimaryGreenPale;
  const dotColor = LessVars.theCoinPrimaryGreenNeutral;
  const from = DateTime.local().minus({months: 1});
  return (
    <Container className={styles.graphBackground}>
      <div className={styles.buttons}>
        <Button secondary>WEEK</Button>
        <Button secondary>MONTH</Button>
        <Button secondary>YEAR</Button>
        <Button secondary>ALL</Button>
      </div>
      <GraphTxHistory
        txs={txs}
        from={from}
        lineColor={lineColor}
        dotColor={dotColor}
        theme={theme}
        height={325}
      />
    </Container>
  )
}
