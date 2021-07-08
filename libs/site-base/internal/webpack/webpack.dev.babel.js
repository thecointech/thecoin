/**
 * DEVELOPMENT WEBPACK CONFIGURATION
 */

const path = require('path');
const webpack = require('webpack');
const { merge } = require("webpack-merge")
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');

const baseOptions = require('./webpack.base.babel');

// In non-live dev mode, we redirect imports to mocked versions
const projectRoot = path.join(__dirname, '..', '..', '..', '..');
const mocksFolder = path.join(projectRoot, '__mocks__');
const mockOptions = process.env.SETTINGS !== 'live'
  ? getMockOptions()
  : getDevLiveOptions()

const devOptions = {
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


function getMockOptions() {
  return {
    module: {
      rules: [
        // Allow ts-loader to parse mocks
        {
          test: /\.ts(x?)$/,
          include: mocksFolder,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: path.join(mocksFolder, '..', 'tsconfig.base.json'),
              transpileOnly: true,
              experimentalWatchApi: true,
            },
          },
        }
      ],
    },
    // Show progress when running dev
    plugins: [
      new webpack.ProgressPlugin(),
    ],
    // Re-use our jest mocks inside our website (neat, huh?)
    resolve: {
      modules: [mocksFolder],
    }
  }
}

function getDevLiveOptions() {
  return {
    experiments: {
      topLevelAwait: true,
    },
    // Re-direct store to js file
    resolve: {
      alias: {
        "@thecointech/account/store": path.join(mocksFolder, "@thecointech", 'account', 'store_devlive.js')
      }
    }
  }
}

module.exports = merge(
  mockOptions,
  devOptions,
  baseOptions,
)
