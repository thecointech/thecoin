/**
 * COMMON WEBPACK CONFIGURATION
 */
import { getEnvFiles } from '../../../../tools/setenv';
import { join, resolve as _resolve } from 'path';
import { DefinePlugin, ProvidePlugin } from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { semantic_less_loader, css_module_loader } from '@thecointech/site-semantic-theme/webpack.less';
import Dotenv from 'dotenv-webpack';
import { getSigner } from '@thecointech/signers';

const configName = process.env.CONFIG_NAME

const projectRoot = process.cwd();
const configFile = join(projectRoot, 'tsconfig.build.json');
const packageFile = join(projectRoot, 'package.json');

const envFiles = getEnvFiles(configName);
const version = require(packageFile).version;

const brokerCad = await getSigner("BrokerCAD");
const xferAsst = await getSigner("BrokerTransferAssistant");

export const externals = ['dtrace-provider', 'fs', 'mv', 'os', 'source-map-support', 'secret-manager'];
export const output = {
  path: _resolve(projectRoot, 'build'),
  publicPath: '/',
};
export const module = {
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
    semantic_less_loader,
    css_module_loader,
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
};
export const plugins = [
  new DefinePlugin({
    __VERSION__: JSON.stringify(version),
    // We need wallet addresses for loading tx's correctly
    'process.env.WALLET_BrokerCAD_ADDRESS': await brokerCad.getAddress(),
    'process.env.WALLET_BrokerTransferAssistant_ADDRESS': await xferAsst.getAddress(),
  }),
  ...envFiles.map(path => new Dotenv({ path, ignoreStub: true })),

  new ForkTsCheckerWebpackPlugin({
    typescript: {
      configFile,
    }
  }),
  new ProvidePlugin({
    process: 'process/browser',
  }),
  new ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
  }),
];
export const resolve = {
  modules: ['node_modules', 'src'],
  conditionNames: [configName, "browser", "webpack", "default"],
  extensions: ['.js', '.jsx', '.react.js', '.ts', '.tsx'],
  fallback: {
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "vm": false,
  }
};
export const target = 'web';
export const performance = {};
