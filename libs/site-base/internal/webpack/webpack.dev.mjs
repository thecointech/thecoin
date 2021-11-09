/**
 * DEVELOPMENT WEBPACK CONFIGURATION
 */

import { resolve } from 'path';
import webpack from 'webpack';
import { merge } from "webpack-merge";
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import ErrorOverlayPlugin from 'error-overlay-webpack-plugin';

import baseOptions from './webpack.base.mjs';
import signerOptions from './webpack.signers.mjs';
// Import options for mocking external modules
import mockOptions from "../../../../__mocks__/mock_webpack.mjs";

const devOptions = {
  mode: 'development',

  // Add hot reloading in development
  entry: [
    'webpack-hot-middleware/client?reload=true',
    resolve('src', 'app.tsx'), // Start with js/app.js
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

  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
    ],
  },
  // Add development plugins
  plugins: [
    new ErrorOverlayPlugin(),
    new webpack.HotModuleReplacementPlugin(), // Tell webpack we want hot reloading
    new HtmlWebpackPlugin({
      inject: true, // Inject all files that are generated by webpack, e.g. bundle.js
      template: 'src/index.html',
      favicon: 'src/images/favicon.png',
    }),
    new CircularDependencyPlugin({
      exclude: /a\.js|node_modules/, // exclude node_modules
      failOnError: false, // show a warning when there is a circular dependency
    }),
  ],

  // Emit a source map for easier debugging
  // See https://webpack.js.org/configuration/devtool/#devtool
  devtool: 'cheap-module-source-map',
  performance: {
    hints: false,
  },
};

// We only post progress in dev mode, not dev:live
// This is because dev:live is streaming all packages
// at once, and the progress updates confuse the terminal
if (process.env.SETTINGS !== 'live') {
  devOptions.plugins.push(
    new webpack.ProgressPlugin(),
  )
}

export default merge(
  mockOptions,
  devOptions,
  signerOptions,
  baseOptions,
)
