import type { LineCustomSvgLayerProps } from "@nivo/line";
import { curveMonotoneX, line } from "d3-shape";
import React from "react";
import { TxDatum, TxSeries } from "./types";

export const RawLineLayer = ({ colors, series, xScale, yScale }: LineCustomSvgLayerProps<TxSeries>) => {
  const lineGenerator = line<[string, number]>()
    .x(dat => xScale(dat[0]))
    .y(dat => yScale(Math.max(dat[1], 0)))
    .curve(curveMonotoneX)

  const [lineColor] = colors as string[];
  const datum = series[0].data.map(d => d.data as TxDatum);
  const stepDatum = datum.map(d => [d.x, d.raw]);
  const d =  lineGenerator(stepDatum as Array<[string, number]>) ?? undefined;

  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={lineColor}
        opacity="0.6"
        strokeWidth={1}
        style={{ pointerEvents: "none" }}
      />
    </>
  );
};

