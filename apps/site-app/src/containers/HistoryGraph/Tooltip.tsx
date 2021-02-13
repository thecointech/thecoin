import { PointTooltipProps } from "@nivo/line";
import React from "react";
import { TxDatum } from "@the-coin/shared/src/components/GraphTxHistory/types";
import styles from './styles.module.less';

export const Tooltip = ({ point }: PointTooltipProps) => {
  const data = point.data as unknown as TxDatum;
  return (
    <div className={`${styles.tooltip}`}>
      <div className={`${styles.profit}`}>Profit: {data.y - data.costBasis}</div>
      <div className="base">Base: {data.costBasis}</div>
      {
        data.txs.length
          ? <div>{data.txs.length} txs</div>
          : undefined
      }
    </div>
  )
}
