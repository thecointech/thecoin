import { PointTooltipProps } from "@nivo/line";
import React from "react";
import { TxDatum } from "./types";
import styles from './styles.module.less';

export const Tooltip = (className?: string) => ({ point }: PointTooltipProps) => {
  const data = point.data as unknown as TxDatum;
  return (
    <div className={`${className ?? styles.tooltip}`}>
      <div className="profit">Profit: {data.y - data.costBasis}</div>
      <div className="base">Base: {data.costBasis}</div>
      {
        data.txs.length
          ? <div>{data.txs.length} txs</div>
          : undefined
      }
    </div>
  )
}
