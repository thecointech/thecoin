const webpack = require('webpack');
const { getEnvFile } = require('../../tools/setenv')
const dotenv = require('dotenv').config({ path: getEnvFile() });
const { merge } = require("webpack-merge")
const mockOptions = require('./webpack.mocks');

const baseOptions = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  mode: process.env.NODE_ENV,
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  resolve: {
    conditionNames: [process.env.CONFIG_NAME, "node", "require", "default"],
    modules: ['node_modules'],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
  },
  plugins: [
    new webpack.EnvironmentPlugin(Object.keys(dotenv.parsed)),
  ],
  performance: { hints: false }
};


module.exports = merge(mockOptions, baseOptions);
