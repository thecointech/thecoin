// Filled by Webpack.
// Version info pulled from package.json
declare const __VERSION__: string;
declare const __APP_BUILD_DATE__: string;

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}
