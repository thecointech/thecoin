import React from "react";
import { BalanceAndProfit } from "@thecointech/shared/containers/Widgets/BalanceAndProfit";
import styles from './styles.module.less';
import { AppContainerWithShadowWithoutPadding } from "components/AppContainers";

export const ColumnRightTop = () => {
  return (
    <div className={styles.columnRightTop}>
        <AppContainerWithShadowWithoutPadding><BalanceAndProfit /></AppContainerWithShadowWithoutPadding>
    </div>
  )
}
