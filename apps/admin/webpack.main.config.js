const { getEnvVars } = require('@thecointech/setenv');
const { merge } = require("webpack-merge")
const getMocks = require('@thecointech/setenv/webpack');
const webpack = require('webpack');
const rules = require('./webpack.rules');

const env = getEnvVars();

const baseOptions = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  mode: env.NODE_ENV,
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: { rules},
  resolve: {
    mainFields: ["main"],
    conditionNames: [env.CONFIG_NAME, "node", "import", "default"],
    modules: ['node_modules'],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
  },
  plugins: [
    new webpack.EnvironmentPlugin(env),
  ],
  performance: { hints: false }
};

module.exports = merge(getMocks(env), baseOptions);
