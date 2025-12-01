import type { LineCustomSvgLayerProps } from "@nivo/line";
import { curveStepAfter, line } from "d3-shape";
import React from "react";
import type { TxDatum, TxSeries } from "./types";

export const StepLineLayer = ({ colors, series, xScale, yScale }: LineCustomSvgLayerProps<TxSeries>) => {
  const lineGenerator = line<[Date, number]>()
    .x(dat => xScale(dat[0]))
    .y(dat => yScale(Math.max(dat[1], 0)))
    .curve(curveStepAfter)

  const [lineColor, dotColor] = colors as string[];
  const datum = series[0].data.map(d => d.data as TxDatum);
  const stepDatum = datum.map(d => [d.x, d.costBasis]);
  const d =  lineGenerator(stepDatum as Array<[Date, number]>) ?? undefined;

  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={lineColor}
        opacity="0.6"
        strokeWidth={2}
        style={{ pointerEvents: "none" }}
      />
      {datum
        .filter(d => d.txs.length > 0)
        .map((d, idx)=> (
        <circle
          key={idx}
          cx={xScale(d.x)}
          cy={yScale(d.y)}
          r={4}
          fill="white"
          strokeWidth={2}
          stroke={dotColor}
          style={{ pointerEvents: "none" }}
        />
      ))}
    </>
  );
};

