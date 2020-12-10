//////////////////////////////////////////////////////////////
//
// This file defines the loaders common to our site build and
// to our storybook webpack based at the root
//

const path = require('path');
const siteBaseRoot = path.resolve(__dirname, '..', '..');

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
          paths: [
            path.join(siteBaseRoot, 'src', 'styles', 'semantic', 'na', 'na'),
          ],
          modifyVars: {
            project_root: `"${siteBaseRoot}"`,
          },
        },
      },
    ],
  },
}
