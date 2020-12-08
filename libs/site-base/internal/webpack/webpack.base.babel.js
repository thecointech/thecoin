/**
 * COMMON WEBPACK CONFIGURATION
 */

const path = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const projectRoot = process.cwd();
const siteBaseRoot = path.resolve(__dirname, '..', '..');
const sharedRoot = path.resolve(siteBaseRoot, '..', 'shared');
const utilsRoot = path.resolve(siteBaseRoot, '..', 'utils-ts');

module.exports = options => ({
  mode: options.mode,
  entry: options.entry,
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
          },
        },
      },
      {
        // Default CSS processing (anything not named *.module.css)
        test: /(?<!module)\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        // CSS/LESS module matching
        test: /.*\.module\.(le|c)ss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true,
              modules: true,
            },
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        // Explicitly process Semantics LESS files
        test: /semantic\.less$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true,
            },
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
              paths: [
                path.join(siteBaseRoot, 'src', 'styles', 'semantic', 'na', 'na'),
                path.join(siteBaseRoot, 'node_modules')
              ],
              modifyVars: {
                project_root: `"${siteBaseRoot}"`,
              },
            },
          },
        ],
      },

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
    }),
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
  ]),
  resolve: {
    modules: ['node_modules', 'src'],
    extensions: ['.js', '.jsx', '.react.js', '.ts', '.tsx'],
    mainFields: ['browser', 'jsnext:main', 'main'],
    plugins: [new TsconfigPathsPlugin({ configFile: "../../tsconfig.base.json"  })],
    alias: {
      '../../theme.config$': path.resolve(
        projectRoot,
        'src/styles/semantic/theme.config',
      ),
      "@the-coin/utilities": "@the-coin/utilities/build",
      "@the-coin/contract": "@the-coin/contract/build",
      "@the-coin/shared": "@the-coin/shared/build",
      "@the-coin/site-base": "@the-coin/site-base/build",
    },
  },
  devtool: options.devtool,
  target: 'web', // Make web variables accessible to webpack, e.g. window
  performance: options.performance || {},
});
