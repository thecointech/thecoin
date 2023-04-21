import type { Configuration } from 'webpack';
//@ts-ignore
import less_loaders from '@thecointech/site-semantic-theme/webpack.less';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import { getEnvVars } from '@thecointech/setenv';
import path from 'path';

const env = getEnvVars();
const rootPath = path.join(__dirname, '../..');
rules.push(
  {
    test: /(?<!module)\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
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

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    conditionNames: [env.CONFIG_NAME, "electron", "browser", "webpack", "import", "default"],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      //"path": require.resolve("path-browserify"),
      "fs": false,
      "vm": false,
    },
    // For reasons I don't understand, the babel interop helpers import
    // the ESM version even when required.
    alias: {
      "@babel/runtime/helpers/interopRequireDefault": `${rootPath}/node_modules/@babel/runtime/helpers/interopRequireDefault.js`,
      "@babel/runtime/helpers/interopRequireWildcard": `${rootPath}/node_modules/@babel/runtime/helpers/interopRequireWildcard.js`
    }
  },
  experiments: {
    topLevelAwait: true,
  },
};
