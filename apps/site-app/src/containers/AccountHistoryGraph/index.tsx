import { useActiveAccount } from "@the-coin/shared/containers/AccountMap/selectors";
import React from "react";
import { Container } from "semantic-ui-react";
import styles from './styles.module.less';
import { GraphTxHistory } from '@the-coin/shared/components/GraphTxHistory'
import { useFxRates } from "@the-coin/shared/containers/FxRate/selectors";
import { variables } from "@the-coin/site-base/styles/variables";

export const AccountHistoryGraph = () => {
  const account = useActiveAccount();
  const txs = account?.history ?? [];
  const fxRates = useFxRates();

  return (
    <Container className={styles.background}>
      <GraphTxHistory
        fxRates={fxRates.rates}
        txs={txs}
        lineColor={variables.theCoinPrimaryGreenPale}
        dotColor={variables.theCoinPrimaryGreenPale}
        height={325}
      />
    </Container>
  )
}
