/**
 * COMMON WEBPACK CONFIGURATION
 */
// IMPORTANT: Run this import step first to ensure env vars are set prior to calling getSigner
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const { getEnvFiles } = require('../../../../tools/setenv');

import { join, resolve as _resolve } from 'path';
import webpack from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import webpack_less from '@thecointech/site-semantic-theme/webpack.less';
import Dotenv from 'dotenv-webpack';

const configName = process.env.CONFIG_NAME;

const projectRoot = process.cwd();
const configFile = join(projectRoot, 'tsconfig.build.json');
const packageFile = join(projectRoot, 'package.json');

const envFiles = getEnvFiles(configName);
const version = require(packageFile).version;


export default {
  externals: ['dtrace-provider', 'fs', 'mv', 'os', 'source-map-support', 'secret-manager'],
  output: {
    path: _resolve(projectRoot, 'build'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        include: join(projectRoot, "src"),
        use: {
          loader: 'ts-loader',
          options: {
            configFile,
            transpileOnly: true,
            experimentalWatchApi: true,
            projectReferences: true,
            compiler: 'ttypescript',
          },
        },
      },
      {
        // Default CSS processing (anything not named *.module.css)
        test: /(?<!module)\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      webpack_less.semantic_less_loader,
      webpack_less.css_module_loader,
      ////////////////////////////////////////////////////////////////
      {
        test: /\.(eot|otf|ttf|woff|woff2)$/,
        use: 'file-loader',
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              // Inline files smaller than 10 kB
              limit: 10 * 1024,
              noquotes: true,
            },
          },
        ],
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              // Inline files smaller than 10 kB
              limit: 10 * 1024,
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                enabled: false,
              },
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 7,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
            },
          },
        ],
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
      {
        test: /\.(mp4|webm)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(version),
    }),
    ...envFiles.map(path => new Dotenv({ path, ignoreStub: true })),

    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile,
      }
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  resolve: {
    modules: ['node_modules', 'src'],
    conditionNames: [configName, "browser", "webpack", "require", "default"],
    extensions: ['.js', '.jsx', '.react.js', '.ts', '.tsx'],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "vm": false,
    }
  },
  target: 'web',
  performance: {},
  experiments: {
    topLevelAwait: true,
  }
}
