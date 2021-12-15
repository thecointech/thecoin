import React from "react";
import { BalanceAndProfit } from "./Widget";
import styles from './styles.module.less';
import { AppContainerWithShadowWithoutPadding } from "components/AppContainers";

export const BalanceWidget = () => (
  <div className={styles.columnRightTop}>
    <AppContainerWithShadowWithoutPadding>
      <BalanceAndProfit />
    </AppContainerWithShadowWithoutPadding>
  </div>
)

