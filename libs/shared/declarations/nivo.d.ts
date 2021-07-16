declare module '@nivo/generators';

declare module '@nivo/core' {
  //  deepcode ignore no-any: not the right time to add definitions to nivo
  export const linearGradientDef: any;
}

declare module '@nivo/line' {
  // Fix bad line definitions (?) https://github.com/plouc/nivo/issues/1604
  export interface CustomLayerProps {
    xScale: (v: DatumValue) => number;
    yScale: (v: DatumValue) => number;
  }
}
