import React from "react";
import { BalanceAndProfit } from "@the-coin/shared/build/containers/Widgets/BalanceAndProfit";
import styles from './styles.module.less';

export const ColumnRightTop = () => {
  return (
    <div className={styles.columnRightTop}>
        <BalanceAndProfit />
    </div>
  )
}
