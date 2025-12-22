//////////////////////////////////////////////////////////////
//
// This file defines the LESS loaders common to our site build and
// to our storybook webpack based at the root
//
import { vars } from './vars.ts';
import type { LoaderContext } from 'webpack';

// In dev mode, leave the modules classnames intact so we can debug easier
const modules = process.env.NODE_ENV !== 'production'
  ? { localIdentName: "[name]__[local]--[hash:base64:5]" }
  : true;

export const css_module_loader = {
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
        modules,
      },
    },
    {
      loader: 'less-loader',
      options: {
        sourceMap: true,
        lessOptions: (loaderContext: LoaderContext<{}>) => vars(loaderContext.resourcePath),
      },
    },
  ],
};
export const semantic_less_loader = {
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
        lessOptions: (loaderContext: LoaderContext<{}>) => vars(loaderContext.resourcePath),
      },
    },
  ],
};
