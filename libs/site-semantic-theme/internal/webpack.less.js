//////////////////////////////////////////////////////////////
//
// This file defines the LESS loaders common to our site build and
// to our storybook webpack based at the root
//
const { paths, modifyVars } = require('./vars');

module.exports = {
  css_module_loader: {
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
          modifyVars,
        },
      },
    ],
  },

  semantic_less_loader: {
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
          paths,
          modifyVars,
        },
      },
    ],
  },
}
