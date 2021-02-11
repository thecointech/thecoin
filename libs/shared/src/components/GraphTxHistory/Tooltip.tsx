import { PointTooltipProps } from "@nivo/line";
import React from "react";

export const Tooltip = ({ point }: PointTooltipProps) => (
  <div
    style={{
      background: 'white',
      padding: '9px 12px',
      border: '1px solid #ccc',
    }}
  >
    <div>x: {point.data.xFormatted}</div>
    <div
      style={{
        color: point.serieColor,
        padding: '3px 0',
      }}
    >
      <strong>{point.serieId}</strong> [{point.data.yFormatted}]
    </div>
  </div>
)
