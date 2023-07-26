import { type Configuration, DefinePlugin, EnvironmentPlugin, } from 'webpack';
import { rules } from './webpack.rules';
import path from 'path';
import { getEnvFiles } from '@thecointech/setenv';
import Dotenv from 'dotenv-webpack';

const packageFile = path.join(__dirname, '../package.json');
const configName = process.env.CONFIG_NAME ?? 'development';
const envFiles = getEnvFiles(configName);

export const mainConfig: Configuration = {
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
  externals: [

  ],
  plugins: [
    new DefinePlugin({
      __VERSION__: JSON.stringify(require(packageFile).version),
      __APP_BUILD_DATE__: JSON.stringify(new Date()),
      ['process.env.TC_LOG_FOLDER']: JSON.stringify('./logs'),
    }),
    ...envFiles.map(path => new Dotenv({ path, ignoreStub: true })),
  ],
  experiments: {
    topLevelAwait: true,
  },
};
