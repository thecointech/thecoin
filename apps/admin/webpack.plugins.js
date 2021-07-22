const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const { getEnvFile } = require('../../tools/setenv')
const dotenv = require('dotenv').config({ path: getEnvFile() });
const packageFile = path.join(__dirname, 'package.json');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new webpack.EnvironmentPlugin(Object.keys(dotenv.parsed)),
  new webpack.DefinePlugin({
    __VERSION__: JSON.stringify(require(packageFile).version),
    "process.env.LOG_NAME": JSON.stringify(process.env.LOG_NAME),
    "process.env.LOG_LEVEL": process.env.LOG_LEVEL,
  }),
  new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
  new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
  }),
];
