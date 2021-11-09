//////////////////////////////////////////////////////////////
//
// This file defines the LESS loaders common to our site build and
// to our storybook webpack based at the root
//
const { paths, modifyVars } = await import('./vars');

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
        modules: true,
      },
    },
    {
      loader: 'less-loader',
      options: {
        sourceMap: true,
        lessOptions: {
          modifyVars,
        }
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
        lessOptions: {
          paths,
          modifyVars,
        }
      },
    },
  ],
};
