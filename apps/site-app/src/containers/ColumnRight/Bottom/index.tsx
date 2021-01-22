import React from "react";
import { ClimateImpact } from "@the-coin/shared/build/containers/Widgets/ClimateImpact";
import styles from "./styles.module.less";

export const ColumnRightBottom = () => {
  return (
    <div className={styles.columnRightBottom}>
        <ClimateImpact />
    </div>
  )
}
