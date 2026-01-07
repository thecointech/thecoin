import type { ModuleOptions } from 'webpack';
//@ts-ignore
import { semantic_less_loader, css_module_loader } from '@thecointech/site-semantic-theme/webpack.less';
import { configFile } from './webpack.common.ts';

export const rules: Required<ModuleOptions>['rules'] = [
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        configFile,
        transpileOnly: true,
      },
    },
  },
  {
    test: /(?<!module)\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
  },
  // Explicitly process Semantics Less files.
  semantic_less_loader,
  // Loaders for module files
  css_module_loader,
  {
    test: /\.(svg|png|jpg|ttf|eot|woff2?)$/,
    type: 'asset'
  },
];
