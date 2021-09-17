/**
 * COMMON WEBPACK CONFIGURATION
 */
const { getEnvFiles } = require('../../../../tools/setenv')
const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const less_loaders = require('@thecointech/site-semantic-theme/webpack.less')
const Dotenv = require('dotenv-webpack');

const configName = process.env.CONFIG_NAME

const projectRoot = process.cwd();
const configFile = path.join(projectRoot, 'tsconfig.build.json');
const packageFile = path.join(projectRoot, 'package.json');

const envFiles = getEnvFiles(configName, true);
const version = require(packageFile).version;

module.exports = {
  // see https://github.com/trentm/node-bunyan#webpack
  externals: ['dtrace-provider', 'fs', 'mv', 'os', 'source-map-support', 'secret-manager'],

  output: {
    path: path.resolve(projectRoot, 'build'),
    publicPath: '/',
  },

  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        include: path.join(projectRoot, "src"),
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

      ////////////////////////////////////////////////////////////////
      // Loaders shared with storybookjs

      // Explicitly process Semantics Less files.
      less_loaders.semantic_less_loader,
      // Loaders for module files
      less_loaders.css_module_loader,

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
                // NOTE: mozjpeg is disabled as it causes errors in some Linux environments
                // Try enabling it in your environment by switching the config to:
                // enabled: true,
                // progressive: true,
              },
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 7,
              },
              pngquant: {
                quality: [0.65, 0.90],
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
    ...envFiles.map(path => new Dotenv({path, ignoreStub: true})),

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
    conditionNames: [configName, "browser", "webpack", "default"],
    extensions: ['.js', '.jsx', '.react.js', '.ts', '.tsx'],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "vm": false,
    }
  },
  target: 'web', // Make web variables accessible to webpack, e.g. window
  performance: {},
}
