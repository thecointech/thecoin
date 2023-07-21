
import webpack from 'webpack';
import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path from 'path';
import { getEnvFiles } from '@thecointech/setenv';
import Dotenv from 'dotenv-webpack';

const packageFile = path.join(__dirname, '../package.json');
const configName = process.env.CONFIG_NAME ?? 'development';
const envFiles = getEnvFiles(configName);

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
  ...envFiles.map(path => new Dotenv({ path, ignoreStub: true })),
  new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
];
