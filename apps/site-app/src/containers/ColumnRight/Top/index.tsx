import React from "react";
import { BalanceAndProfit } from "@the-coin/shared/build/containers/Widgets/BalanceAndProfit";
import styles from "./styles.module.less";

export const ColumnRightTop = () => {
  //const { locale } = useSelector(selectLocale);
  return (
    <div className={styles.columnRightTop}>
        <BalanceAndProfit />
    </div>
  )
}
