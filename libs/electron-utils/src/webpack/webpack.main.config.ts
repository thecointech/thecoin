import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
//@ts-ignore
import getMocks from '@thecointech/setenv/webpack';
import { rules } from './webpack.rules.js';
import { env, commonBase } from './webpack.common.js';

export const baseOptions: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    conditionNames: [env.CONFIG_NAME!, "node", "import", "default"],
  },
  experiments: {
    topLevelAwait: true,
  },
};

export const mainConfig = (custom: Configuration = {}) => merge(
  custom,
  getMocks(env),
  baseOptions,
  commonBase,
);
