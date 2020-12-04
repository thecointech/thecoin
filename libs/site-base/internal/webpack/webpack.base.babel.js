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
            logLevel: 'info',
            experimentalWatchApi: true,
            projectReferences: true,
          },
        },
      },
      {
        // Preprocess our own .css files
        // This is the place to add your own loaders (e.g. sass/less etc.)
        // for a list of loaders, see https://webpack.js.org/loaders/#styling
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        // Preprocess 3rd party .css files located in node_modules
        test: /\.css$/,
        include: /node_modules/,
        use: ['style-loader', 'css-loader'],
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
        // The rest of the less files
        test: /.*\.module\.less$/,
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
