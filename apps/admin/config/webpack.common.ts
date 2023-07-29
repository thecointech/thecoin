import { DefinePlugin } from 'webpack';
import path from 'path';
import { getEnvFiles } from '@thecointech/setenv';
import Dotenv from 'dotenv-webpack';

export const configName = process.env.CONFIG_NAME ?? 'development';
const packageFile = path.join(__dirname, '../package.json');
const envFiles = getEnvFiles(configName);

export const commonPlugins = [
  new DefinePlugin({
    __VERSION__: JSON.stringify(require(packageFile).version),
    __APP_BUILD_DATE__: JSON.stringify(new Date()),
  }),
  ...envFiles.map(path => new Dotenv({ path, ignoreStub: true })),
]
