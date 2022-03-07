declare module '@nivo/line' {
  // Fix bad line definitions (?) https://github.com/plouc/nivo/issues/1604
  export interface CustomLayerProps {
    xScale: (v: DatumValue) => number;
    yScale: (v: DatumValue) => number;
  }
}
