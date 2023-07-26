const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const { getEnvVars } = require('@thecointech/setenv')

const packageFile = path.join(__dirname, 'package.json');

const env = getEnvVars();

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new webpack.DefinePlugin({
    __VERSION__: JSON.stringify(require(packageFile).version),
    BROWSER: true,
  }),
  new webpack.EnvironmentPlugin(env),
  new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
  new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
  }),
];
