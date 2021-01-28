import React from "react";
import { BalanceAndProfit } from "@the-coin/shared/build/containers/Widgets/BalanceAndProfit";
import getWindowDimensions from '@the-coin/site-base/components/WindowDimensions';
import { breakpointsValues } from '@the-coin/site-base/components/ResponsiveTool';
import styles from "./styles.module.less";

export const ColumnRightTop = () => {
  
  let classForColumn = styles.columnRightTop;
  const windowDimension = getWindowDimensions();
  const breakpointTablet = breakpointsValues.tablet;
  
  // If Small Screen / Mobile
  if (windowDimension.width <= breakpointTablet){
    classForColumn = styles.columnRightTopMobile;
  }

  return (
    <div className={classForColumn}>
        <BalanceAndProfit />
    </div>
  )
}
