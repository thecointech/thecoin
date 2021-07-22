const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const less_loaders = require('@thecointech/site-semantic-theme/webpack.less')
const { merge } = require("webpack-merge")
const path = require('path');

rules.push(
  {
    test: /\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
  },
  // Explicitly process Semantics Less files.
  less_loaders.semantic_less_loader,
  // Loaders for module files
  less_loaders.css_module_loader,
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
);

const mocked = require('./webpack.mocked.config');
const baseOptions = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "os": false,
      "fs": false,
      "vm": false
    }
  },
}

module.exports = merge(mocked, baseOptions);
