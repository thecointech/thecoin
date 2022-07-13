const webpack = require('webpack');
const { merge } = require("webpack-merge")
const mockOptions = require('./webpack.mocks');
const rules = require('./webpack.rules');
const { getEnvVars } = require('@thecointech/setenv');

const vars = getEnvVars();
const baseOptions = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  mode: vars.NODE_ENV,
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: { rules},
  resolve: {
    mainFields: ["main"],
    conditionNames: [vars.CONFIG_NAME, "node", "import", "default"],
    modules: ['node_modules'],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
  },
  plugins: [
    new webpack.EnvironmentPlugin(vars),
  ],
  performance: { hints: false }
};


module.exports = merge(mockOptions, baseOptions);
