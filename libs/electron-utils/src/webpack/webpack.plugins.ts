import webpack from 'webpack';
// import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { configFile } from './webpack.common.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
// const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require();

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
    typescript: {
      configFile,
    }
  }),
  new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
  new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
  }),
  new webpack.DefinePlugin({
    BROWSER: true,
  }),
];
