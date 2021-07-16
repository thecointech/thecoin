const path = require('path');
const shared_loaders = require('@thecointech/site-semantic-theme/webpack.less');
const mocksFolder = path.join(__dirname, '..', '__mocks__');
const { DefinePlugin } = require('webpack');
const { merge } = require("webpack-merge")

module.exports = {
  features: {
    previewCsfV3: true,
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
      ["@babel/plugin-proposal-class-properties", { loose: true }],
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
  webpackFinal: async (config, { configType }) => {
    const r = merge(
      {
        module: {
          rules: [
            shared_loaders.semantic_less_loader,
            shared_loaders.css_module_loader,
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
        }
      },
      config);
    console.log(r);
    return r;
  },
  core: {
    builder: "webpack5",
  },
}
