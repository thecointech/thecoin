import React from "react";
import { BalanceAndProfit } from "@thecointech/shared/containers/Widgets/BalanceAndProfit";
import styles from './styles.module.less';
import { AppContainerWithShadowWithoutPadding } from "components/AppContainers";

export const ColumnRightTop = () => {
  const box = document.querySelector('.inAppContent');
  const rect = box?.getBoundingClientRect();
  
  if (rect){
    const isInViewport = rect!.top >= 0 &&
            rect!.left >= 0 &&
            rect!.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect!.right <= (window.innerWidth || document.documentElement.clientWidth);
    
  console.log("inAppContent---",isInViewport);
  }
  //const activeAccount = useActiveAccount();
  const rightColumnTop = rect ? <BalanceAndProfit /> : "";

  
  return (
    <div className={styles.columnRightTop}>
        <AppContainerWithShadowWithoutPadding>{rightColumnTop}</AppContainerWithShadowWithoutPadding>
    </div>
  )
}
