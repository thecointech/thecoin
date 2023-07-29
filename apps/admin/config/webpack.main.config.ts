import type { Configuration } from 'webpack';
import merge from 'webpack-merge';
//@ts-ignore
import getMocks from '@thecointech/setenv/webpack';
import { rules } from './webpack.rules';
import { configName, commonPlugins } from './webpack.common';
import { getEnvVars } from '@thecointech/setenv';

const env = getEnvVars();

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
    conditionNames: [configName, "node", "import", "default"],
  },
  plugins: commonPlugins,
  experiments: {
    topLevelAwait: true,
  },
};

export const mainConfig = merge(getMocks(env), baseOptions);
