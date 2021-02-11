import { CustomLayerProps } from "@nivo/line";
import { curveStepAfter, line } from "d3-shape";
import React from "react";

export const StepLineLayer = ({ colors, series, xScale, yScale }: CustomLayerProps) => {
  const lineGenerator = line()
    .x(dat => xScale(dat[0]))
    .y(dat => yScale(Math.max(dat[1], 0)))
    .curve(curveStepAfter)

  const datum = series[0].data.map(d => [d.data.x, d.data.costBasis]);
  const d =  lineGenerator(datum as any) ?? undefined;
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={(colors as string)}
        opacity="0.6"
        strokeWidth={2}
        style={{ pointerEvents: "none" }}
      />
      {/* {bars.map(bar => (
        <circle
          key={bar.key}
          cx={xScale(bar.data.index) + bar.width / 2}
          cy={yScale(bar.data.data.v1)}
          r={4}
          fill="white"
          stroke={lineColor}
          style={{ pointerEvents: "none" }}
        />
      ))}*/}
    </>
  );
};

