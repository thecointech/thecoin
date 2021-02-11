import React from "react";
import { useActiveAccount } from "@the-coin/shared/containers/AccountMap/selectors";
import { Container } from "semantic-ui-react";
import { GraphTxHistory } from '@the-coin/shared/components/GraphTxHistory'
import { variables } from "@the-coin/site-base/styles/variables";
import { DateTime } from "luxon";
import styles from './styles.module.less';

export const HistoryGraph = () => {
  const account = useActiveAccount();
  const txs = account?.history ?? [];

  //const to = DateTime.local();
  const color = "red"; //variables.theCoinPrimaryGreenPale;
  const from = DateTime.local().minus({months: 1});
  return (
    <Container className={styles.graphBackground}>
      <GraphTxHistory
        txs={txs}
        from={from}
        lineColor={color}
        dotColor={variables.theCoinPrimaryGreenPale}
        height={325}
      />
    </Container>
  )
}
