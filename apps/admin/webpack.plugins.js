const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const { getEnvVars } = require('../../tools/setenv')
const packageFile = path.join(__dirname, 'package.json');

const env = getEnvVars();
const keys = Object.keys(env)

const envObj = keys.reduce((prev, key) => ({
  ...prev,
  [key]: JSON.stringify(env[key])
}), {});

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new webpack.DefinePlugin({
    __VERSION__: JSON.stringify(require(packageFile).version),
    "process.env.LOG_NAME": JSON.stringify(process.env.LOG_NAME),
    "process.env.LOG_LEVEL": process.env.LOG_LEVEL,
  }),
  new webpack.DefinePlugin({
    "process.env": envObj,
  }),
  new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
  new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
  }),
];
