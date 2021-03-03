/**
 * DEVELOPMENT WEBPACK CONFIGURATION
 */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const process = require('process');

const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');

module.exports = require('./webpack.base.babel')({
  mode: 'development',

  // Add hot reloading in development
  entry: [
    'webpack-hot-middleware/client?reload=true',
    path.resolve('src', 'app.tsx'), // Start with js/app.js
  ],

  // Don't use hashes in dev mode for better performance
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },

  rules: [
    {
      test: /\.js$/,
      enforce: 'pre',
      use: ['source-map-loader'],
    },
  ],

  // Disable unused vars for debug builds.
  // Costs too much time when debugging
  tsCompilerOptions: {
    noUnusedLocals: false,
    noUnusedParameters: false,
  },

  // Add development plugins
  plugins: [
    new ErrorOverlayPlugin(),
    new webpack.ProgressPlugin(),
    new webpack.HotModuleReplacementPlugin(), // Tell webpack we want hot reloading
    new HtmlWebpackPlugin({
      inject: true, // Inject all files that are generated by webpack, e.g. bundle.js
      template: 'src/index.html',
    }),
    new CircularDependencyPlugin({
      exclude: /a\.js|node_modules/, // exclude node_modules
      failOnError: false, // show a warning when there is a circular dependency
    }),
    new webpack.EnvironmentPlugin({
      TC_LOG_FOLDER: undefined, // disable logging to file
    })
  ],

  // Emit a source map for easier debugging
  // See https://webpack.js.org/configuration/devtool/#devtool
  devtool: 'cheap-module-source-map',

  performance: {
    hints: false,
  },
});
