/**
 * COMMON WEBPACK CONFIGURATION
 */
require('../../../../tools/setenv')
const path = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const less_loaders = require('@thecointech/site-semantic-theme/webpack.less')

const projectRoot = process.cwd();

module.exports = options => ({
  mode: options.mode,
  entry: options.entry,

  // see https://github.com/trentm/node-bunyan#webpack
  externals: ['dtrace-provider', 'fs', 'mv', 'os', 'source-map-support', 'secret-manager'],

  output: Object.assign(
    {
      // Compile into js/build.js
      path: path.resolve(projectRoot, 'build'),
      publicPath: '/',
    },
    options.output,
  ), // Merge with env dependent settings

  optimization: options.optimization,
  module: {
    rules: [
      ...options.rules,
      {
        test: /\.ts(x?)$/,
        include: path.join(projectRoot, "src"),
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.join(projectRoot, 'tsconfig.build.json'),
            transpileOnly: true,
            experimentalWatchApi: true,
            projectReferences: true,
            compilerOptions: options.tsCompilerOptions,
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
                quality: '65-90',
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
  plugins: options.plugins.concat([
    // Always expose NODE_ENV to webpack, in order to use `process.env.NODE_ENV`
    // inside your code for any environment checks; Terser will automatically
    // drop any unreachable code.
    new webpack.EnvironmentPlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      SETTINGS: JSON.stringify(process.env.SETTINGS),
      CONFIG_NAME: JSON.stringify(process.env.CONFIG_NAME),

      INFURA_PROJECT_ID: JSON.stringify(process.env.INFURA_PROJECT_ID),

      URL_SITE_APP: JSON.stringify(process.env.URL_SITE_APP),
      URL_SITE_LANDING: JSON.stringify(process.env.URL_SITE_LANDING),
      URL_SERVICE_BROKER: JSON.stringify(process.env.URL_SERVICE_BROKER),
      URL_SERVICE_RATES: JSON.stringify(process.env.URL_SERVICE_RATES),

      DEPLOY_NETWORK: JSON.stringify(process.env.DEPLOY_NETWORK),
      DEPLOY_NETWORK_PORT: JSON.stringify(process.env.DEPLOY_NETWORK_PORT),
    }),
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
  ]),
  resolve: {
    modules: ['node_modules', 'src'],
    extensions: ['.js', '.jsx', '.react.js', '.ts', '.tsx'],
    mainFields: ['browser', 'jsnext:main', 'main'],
    plugins: [new TsconfigPathsPlugin({ configFile: "../../tsconfig.base.json"  })],
    alias: {
      "@thecointech/utilities": "@thecointech/utilities/build",
      "@thecointech/contract": "@thecointech/contract/build",
      "@thecointech/shared": "@thecointech/shared/build",
      "@thecointech/site-semantic-theme": "@thecointech/site-semantic-theme/build",
      "@thecointech/site-base": "@thecointech/site-base/build",
    },
  },
  devtool: options.devtool,
  target: 'web', // Make web variables accessible to webpack, e.g. window
  performance: options.performance || {},
});
