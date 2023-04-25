import { CustomLayerProps } from "@nivo/line";
import { curveMonotoneX, line } from "d3-shape";
import React from "react";
import { TxDatum } from "./types";

export const RawLineLayer = ({ colors, series, xScale, yScale }: CustomLayerProps) => {
  const lineGenerator = line()
    .x(dat => xScale(dat[0]))
    .y(dat => yScale(Math.max(dat[1], 0)))
    .curve(curveMonotoneX)

  const [lineColor] = colors as string[];
  const datum = series[0].data.map(d => d.data as TxDatum);
  const stepDatum = datum.map(d => [d.x, d.raw]);
  const d =  lineGenerator(stepDatum as Array<[number, number]>) ?? undefined;

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

