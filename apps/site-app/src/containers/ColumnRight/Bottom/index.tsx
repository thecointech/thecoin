import React from "react";
import { ClimateImpact } from "@the-coin/shared/build/containers/Widgets/ClimateImpact";
import getWindowDimensions from '@the-coin/site-base/components/WindowDimensions';
import { breakpointsValues } from '@the-coin/site-base/components/ResponsiveTool';
import styles from "./styles.module.less";

export const ColumnRightBottom = () => {

  let classForColumn = styles.columnRightBottom;
  const windowDimension = getWindowDimensions();
  const breakpointTablet = breakpointsValues.tablet;
  
  // If Small Screen / Mobile
  if (windowDimension.width <= breakpointTablet){
    classForColumn = styles.columnRightBottomMobile;
  }

  return (
    <div className={classForColumn}>
        <ClimateImpact />
    </div>
  )
}
