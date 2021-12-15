import React from "react";
import { ClimateImpact } from "@thecointech/shared/containers/Widgets/ClimateImpact";
import styles from './styles.module.less';

export const ClimateImpactWidget = () => {

  return (
    <div className={`${styles.columnRightBottom} x2spaceBefore`}>
        <ClimateImpact/>
    </div>
  )
}
