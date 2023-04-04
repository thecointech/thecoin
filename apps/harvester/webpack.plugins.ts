
import webpack from 'webpack';
import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { getEnvVars } from '@thecointech/setenv';
import path from 'path';

const packageFile = path.join(__dirname, 'package.json');

const env = getEnvVars();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new webpack.DefinePlugin({
    __VERSION__: JSON.stringify(require(packageFile).version),
    BROWSER: true,
  }),
  new webpack.EnvironmentPlugin(env),
  new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
];
