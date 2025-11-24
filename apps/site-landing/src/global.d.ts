declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '@nivo/line' {
  // Fix bad line definitions (?) https://github.com/plouc/nivo/issues/1604
  export interface CustomLayerProps {
    xScale: (v: DatumValue) => number;
    yScale: (v: DatumValue) => number;
  }
}


declare module '*.svg';

declare module '*.jpg';

declare module '*.png';

type MaybeString = string | undefined;
type MaybeNumber = number | undefined;
