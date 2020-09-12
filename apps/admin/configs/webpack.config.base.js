/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import { dependencies } from '../package.json';
import { GenerateAliases } from './patchpaths';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export default {
  externals: [
    "puppeteer",
    "pouchdb",
    //"firebase",
    //...Object.keys(dependencies || {})
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
              configFile: path.join(__dirname, '..', 'tsconfig.build.json'),
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
    alias: GenerateAliases()
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),
    new webpack.NamedModulesPlugin(),
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
  ]
};
