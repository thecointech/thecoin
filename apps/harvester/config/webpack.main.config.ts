import { type Configuration, DefinePlugin, EnvironmentPlugin, } from 'webpack';
import { rules } from './webpack.rules';
import path from 'path';
import { getEnvVars } from '@thecointech/setenv';

const env = getEnvVars();
const packageFile = path.join(__dirname, '../package.json');

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
  },
  externals: [

  ],
  plugins: [
    new DefinePlugin({
      __VERSION__: JSON.stringify(require(packageFile).version),
    }),
    new EnvironmentPlugin({
      // TODO: Electron doesn't support root-level await,
      // so there is no way to load this data dynamically.
      // Think long-n-hard about a better way to figure this out
      WALLET_BrokerCAD_ADDRESS: "0x0000000000000000000000000000000000000000",
      TC_LOG_FOLDER: './logs',
      ...env
    }),
  ],
  experiments: {
    topLevelAwait: true,
  },
};
