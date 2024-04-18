import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import path from 'path';
import merge from 'webpack-merge';
//@ts-ignore
import getMocks from '@thecointech/setenv/webpack';
import { env } from './webpack.common';

const rootPath = path.join(__dirname, '../../../..');

const baseOptions: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    conditionNames: [env.CONFIG_NAME, "electron", "browser", "webpack", "import", "default"],
    modules: [path.resolve(process.cwd(), 'src'), 'node_modules'],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "fs": false,
      "vm": false,
    },
    // For reasons I don't understand, the babel interop helpers import
    // the ESM version even when required.
    alias: {
      "@babel/runtime/helpers/interopRequireDefault": `${rootPath}/node_modules/@babel/runtime/helpers/interopRequireDefault.js`,
      "@babel/runtime/helpers/interopRequireWildcard": `${rootPath}/node_modules/@babel/runtime/helpers/interopRequireWildcard.js`
    },
  },
  experiments: {
    topLevelAwait: true,
  },
};

export const rendererConfig = merge(getMocks(env), baseOptions);
