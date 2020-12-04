/**
 * DEVELOPMENT WEBPACK CONFIGURATION
 */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const process = require('process');

const projectRoot = process.cwd();
const siteBaseRoot = path.resolve(__dirname, '..', '..');
const sharedRoot = path.resolve(siteBaseRoot, '..', 'shared');
const utilsRoot = path.resolve(siteBaseRoot, '..', 'utils-ts');

// 1. import default from the plugin module
//const createStyledComponentsTransformer = require('typescript-plugin-styled-components')
//  .default;

// 2. create a transformer;
// the factory additionally accepts an options object which described below
//const styledComponentsTransformer = createStyledComponentsTransformer();
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');

module.exports = require('./webpack.base.babel')({
  mode: 'development',

  // Add hot reloading in development
  entry: [
    require.resolve('react-app-polyfill/ie11'),
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

  // Add development plugins
  plugins: [
    new ErrorOverlayPlugin(),
    new webpack.HotModuleReplacementPlugin(), // Tell webpack we want hot reloading
    new HtmlWebpackPlugin({
      inject: true, // Inject all files that are generated by webpack, e.g. bundle.js
      template: 'src/index.html',
    }),
    new CircularDependencyPlugin({
      exclude: /a\.js|node_modules/, // exclude node_modules
      failOnError: false, // show a warning when there is a circular dependency
    }),
  ],

  // tranpile-only, fork-ts-checker-webpack-plugin is used for type checking
  tsLoaders: [
    {
      loader: 'ts-loader',
      options: {
        configFile: path.join(projectRoot, 'tsconfig.build.json'),
        transpileOnly: true,
        logLevel: 'info',
      },
    },
    {
      loader: 'ts-loader',
      options: {
        configFile: path.join(siteBaseRoot, 'tsconfig.build.json'),
        transpileOnly: true,
        projectReferences: true,
        logLevel: 'info',
      },
    },
  ],

  // Emit a source map for easier debugging
  // See https://webpack.js.org/configuration/devtool/#devtool
  devtool: 'cheap-module-source-map',

  performance: {
    hints: false,
  },
});
