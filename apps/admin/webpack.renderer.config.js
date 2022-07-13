const { merge } = require("webpack-merge")
const { getEnvVars } = require('@thecointech/setenv');
const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const getMocks = require('@thecointech/setenv/webpack');
const less_loaders = require('@thecointech/site-semantic-theme/webpack.less');
const path = require('path');

const env = getEnvVars();

rules.push(
  // Default CSS processing (anything not named *.module.css)
  {
    test: /(?<!module)\.css$/,
    use: [
      { loader: 'style-loader' },
      {
        loader: 'css-loader',
        options: {
          url: {
            filter: (url, resourcePath) => {
              // resourcePath - path to css file

              // Don't handle `data:` urls
              if (url.startsWith('data:')) {
                return false;
              }

              return true;
            },
          },
        }
      }
    ],
  },
  // Explicitly process Semantics Less files.
  less_loaders.semantic_less_loader,
  // Loaders for module files
  less_loaders.css_module_loader,
  {
    test: /\.(svg|png|jpg|ttf|eot|woff2?)$/,
    type: 'asset'
  },
);

const baseOptions = {
  mode: env.NODE_ENV,
  module: {
    rules,
  },
  plugins,
  resolve: {
    conditionNames: [env.CONFIG_NAME, "electron", "browser", "require", "default"],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      // "http": require.resolve("stream-http"),
      // "https": require.resolve("https-browserify"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "fs": false,
      "vm": false,
      // Loading google-auth-library
      // "zlib": false,
      // "os": false,
      // "child_process": false,
      // "http2": false,
      // "net": false,
      // "tls": false,

    }
  },
  experiments: {
    topLevelAwait: true,
  },
  performance: { hints: false },
  ignoreWarnings: [/require function is used in a way in which/],
}

module.exports = merge(getMocks(env), baseOptions);
