/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const configFile = path.join(__dirname, '..', 'tsconfig.build.json');

export default {
  externals: [
    "puppeteer",
    "pouchdb",
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile,
              transpileOnly: true, // fork-ts-checker-webpack-plugin is used for type checking
              projectReferences: true,
              logLevel: 'info',
            }
          }
        ]
      }
    ]
  },

  output: {
    path: path.join(__dirname, '..', 'app'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    modules: ['node_modules', 'app'],
    extensions: ['.js', '.ts', '.tsx', '.json'],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile,
      }
    }),
  ]
};
