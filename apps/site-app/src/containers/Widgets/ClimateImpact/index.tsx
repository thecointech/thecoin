import React from "react";
import { ClimateImpact } from "./Widget";
import styles from './styles.module.less';

export const ClimateImpactWidget = () => {

  return (
    <div className={`${styles.columnRightBottom} x2spaceBefore`}>
      <ClimateImpact />
    </div>
  )
}