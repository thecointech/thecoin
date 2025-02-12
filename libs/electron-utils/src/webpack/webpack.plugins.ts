import { DefinePlugin, ProvidePlugin } from 'webpack';
import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { configFile } from './webpack.common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
    typescript: {
      configFile,
    }
  }),
  new ProvidePlugin({
    process: 'process/browser',
  }),
  new ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
  }),
  new DefinePlugin({
    BROWSER: true,
  }),
];
