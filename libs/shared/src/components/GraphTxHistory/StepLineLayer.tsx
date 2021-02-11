import { CustomLayerProps } from "@nivo/line";
import { curveStepAfter, line } from "d3-shape";
import React from "react";

export const StepLineLayer = (color: string) => ({ series, xScale, yScale }: CustomLayerProps) => {
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
        stroke={color}
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

// const AreaLayer = ({ series, xScale, yScale, innerHeight }) => {
//   const areaGenerator = area()
//       .x(d => xScale(d.data.x))
//       .y0(d => Math.min(innerHeight, yScale(d.data.y - 40)))
//       .y1(d => yScale(d.data.y + 10))
//       .curve(curveMonotoneX)

//   return (
//       <>
//           <Defs
//               defs={[
//                   {
//                       id: 'pattern',
//                       type: 'patternLines',
//                       background: 'transparent',
//                       color: '#3daff7',
//                       lineWidth: 1,
//                       spacing: 6,
//                       rotation: -45,
//                   },
//               ]}
//           />
//           <path
//               d={areaGenerator(series[0].data)}
//               fill="url(#pattern)"
//               fillOpacity={0.6}
//               stroke="#3daff7"
//               strokeWidth={2}
//           />
//       </>
//   )
// }
