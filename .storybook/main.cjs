const path = require('path');
const rootFolder = path.join(__dirname, '..');
const mocksFolder = path.join(rootFolder, '__mocks__');
const { DefinePlugin } = require('webpack');
const { AbsolutePathRemapper } = require('@thecointech/storybook-abs-paths');
const { merge } = require("webpack-merge")

module.exports = {
  features: {
    previewCsfV3: true,
    storyStoreV7: true,
  },
  stories: [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(ts|tsx)",
    "../libs/*/!(node_modules)/**/*.stories.@(js|jsx|ts|tsx)",
    "../apps/*/!(node_modules)/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  babel: async (options) => ({
    ...options,
    plugins: [
      ...options.plugins,
      [
        "formatjs",
        {
          "idInterpolationPattern": "[sha512:contenthash:base64:6]",
          "ast": true
        }
      ],
    ]
  }),
  webpackFinal: async (config) => {
    const shared_loaders = await import('@thecointech/site-semantic-theme/webpack.less');

    const r = merge(
      {
        module: {
          rules: [
            shared_loaders.semantic_less_loader,
            shared_loaders.css_module_loader,
            {
              test: /\.m?js/,
              resolve: {
                fullySpecified: false,
              },
            },
          ]
        },
        plugins: [
          new DefinePlugin({ // Log Everything
            "process.env.LOG_NAME": JSON.stringify("Storybook"),
            "process.env.LOG_LEVEL": 0,
          })
        ],
        experiments: {
          topLevelAwait: true,
        },
        resolve: {
          alias: {
            "fs": false,
          },
          modules: [mocksFolder],
        },
        plugins: [
          new AbsolutePathRemapper()
        ]
      },
      config);
    // Exclude our build folder from compilation.
    // This is because shared/site-base build to ES2017
    // which somehow breaks the FormatJS babel plugin.
    const babelRule = r.module.rules.find(rule => rule.include?.includes?.(rootFolder));
    babelRule.exclude = /(node_modules)|(build)/
    return r;
  },
  core: {
    builder: "webpack5",
  },
}
