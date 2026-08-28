"use client";
import React, { type FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { ResponsiveLine } from "@nivo/line";
import styles from './GraphCompareMarketInflation.module.css'
import { getData } from "./data";

/**
 * Props for `GraphCompareMarketInflation`.
 */
export type GraphCompareMarketInflationProps =
  SliceComponentProps<Content.GraphCompareMarketInflationSlice>;

const chartTheme = {
  text: { fill: "#ffffff" },
  axis: {
    domain: { line: { stroke: "#ffffff" } },
    ticks: {
      line: { stroke: "#ffffff" },
      text: { fill: "#ffffff" },
    },
    legend: { text: { fill: "#ffffff" } },
  },
  grid: { line: { stroke: "#555555" } },
  legends: { text: { fill: "#ffffff" } },
  tooltip: {
    container: { background: "#333333", color: "#ffffff" },
  },
};

/**
 * Component for "GraphCompareMarketInflation" Slices.
 */
const GraphCompareMarketInflation: FC<GraphCompareMarketInflationProps> = ({
  slice,
}) => {
  const startDate = slice.primary.startingdate;
  const start = new Date(startDate ?? "2001-01-01");
  const data = getData(start);
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={styles.container}
    >
      <div style={{ height: 400 }}>
        <ResponsiveLine
          data={data}
          theme={chartTheme}
          margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
          xScale={{
            type: "time",
            format: "%Y-%m-%d",
            useUTC: false,
            precision: "month",
          }}
          yScale={{ type: "log", min: 10, max: 1000 }}
          axisBottom={{
            format: "%Y",
            tickValues: "every year",
            tickRotation: -45,
            legend: "Year",
            legendOffset: 36,
          }}
          xFormat="time:%Y-%m-%d"
          axisLeft={{
            legend: "Value of $100 (2000 = 100)",
            legendOffset: -50,
          }}
          colors={{ scheme: "category10" }}
          enablePoints={false}
          enableGridX={false}
          legends={[
            {
              anchor: "top-right",
              direction: "column",
              translateX: -10,
              translateY: -10,
              itemWidth: 120,
              itemHeight: 20,
            },
          ]}
        />
      </div>
    </section>
  );
};

export default GraphCompareMarketInflation;
