/**
 * COMMON WEBPACK CONFIGURATION
 */
import { getEnvFiles } from '@thecointech/setenv';
import { getSecret } from '@thecointech/secrets';
import { join, resolve as _resolve } from 'path';
import webpack from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { semantic_less_loader, css_module_loader } from '@thecointech/site-semantic-theme/webpack.less';
import Dotenv from 'dotenv-webpack';

import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method

const configName = process.env.CONFIG_NAME;
const projectRoot = process.cwd();
const configFile = join(projectRoot, 'tsconfig.build.json');

const envFiles = getEnvFiles(configName);

export async function getBaseConfig(secrets = []) {
  const loaded = await Promise.all(
    secrets.map(async s => ({
      name: s,
      value: await getSecret(s)
    }))
  );
  const secretObj = Object.fromEntries(loaded.map(s => [s.name, s.value]));

  // When building in dev config, include mocked files across libs
  const tsIncludeOpt = configName === 'development'
    ? [join(projectRoot, 'src'), /[\\/]libs[\\/].+[\\/]mocked[\\/]/]
    : join(projectRoot, 'src');

  return {
    externals: ['dtrace-provider', 'mv', 'os', 'source-map-support', 'secret-manager', 'http'],
    output: {
      path: _resolve(projectRoot, 'build'),
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          include: tsIncludeOpt,
          use: {
            loader: 'ts-loader',
            options: {
              configFile,
              transpileOnly: true,
              experimentalWatchApi: true,
              projectReferences: true,
            },
          },
        },
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
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
          test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2|mp4|webm)$/i,
          // More information here https://webpack.js.org/guides/asset-modules/
          type: "asset",
        },
        {
          test: /\.html$/,
          use: 'html-loader',
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        BROWSER: true,
        // We need to pass through the LOG_NAME as it is
        // not defined in the .env files loaded below
        "process.env.LOG_NAME": JSON.stringify(process.env.LOG_NAME),
        // We shouldn't actually have secrets in our site,
        // move relevant code to the backend instead
        __COMPILER_REPLACE_SECRETS__: JSON.stringify(secretObj),
      }),
      ...envFiles.map(path => new Dotenv({
        path,
        ignoreStub: true,
        expand: true,
        systemvars: true,
      })),

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
      alias: {
        // Manually override import paths because the package that imports
        // these modules is commonjs but @babel/runtime supports ESM
        "@babel/runtime/helpers/interopRequireDefault": join(projectRoot, "../../node_modules/@babel/runtime/helpers/interopRequireDefault.js"),
        "@babel/runtime/helpers/interopRequireWildcard": join(projectRoot, "../../node_modules/@babel/runtime/helpers/interopRequireWildcard.js")
      },
      modules: ['node_modules', 'src'],
      conditionNames: [configName, "browser", "webpack", "import", "default"],
      extensions: ['.js', '.jsx', '.react.js', '.ts', '.tsx'],
      fallback: {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "vm": false,
        "fs": false,
        "path": false,
      }
    },
    target: 'web',
    performance: {},
    experiments: {
      topLevelAwait: true,
    }
  }
}
