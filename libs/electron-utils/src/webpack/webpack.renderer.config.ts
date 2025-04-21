import type { Configuration } from 'webpack';
import { rules } from './webpack.rules.js';
import { plugins } from './webpack.plugins.js';
import path from 'path';
import { merge } from 'webpack-merge';
//@ts-ignore (TODO: convert setenv to typescript/module)
import getMocks from '@thecointech/setenv/webpack';
import { env, commonBase } from './webpack.common.js';
import webpack from 'webpack';
import { getSecret } from '@thecointech/secrets';

const rootPath = path.join(process.cwd(), '../..');

function resolveModulePath(moduleSpecifier: string) {
  const moduleUrl = import.meta.resolve(moduleSpecifier);
  return new URL(moduleUrl).pathname; // Extract the pathname
}

const PolygonscanApiKey = await getSecret("PolygonscanApiKey");

const baseOptions: Configuration = {
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    // NOTE: This is used only by
    new webpack.DefinePlugin({
      "process.env.LOG_NAME": JSON.stringify(process.env.LOG_NAME),
      __COMPILER_REPLACE_SECRETS__: JSON.stringify({PolygonscanApiKey}),
    }),
  ],
  externals: {
    electron: 'commonjs electron'
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    conditionNames: [env.CONFIG_NAME!, "electron", "browser", "webpack", "import", "default"],
    modules: [path.resolve(process.cwd(), 'src'), 'node_modules'],
    fallback: {
      "crypto": resolveModulePath("crypto-browserify"),
      "stream": resolveModulePath("stream-browserify"),
      "path": resolveModulePath("path-browserify"),
      "http": false,
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

export const rendererConfig = merge(
  getMocks(env),
  baseOptions,
  commonBase
);
