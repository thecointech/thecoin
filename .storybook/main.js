var shared_loaders = require('@thecointech/site-semantic-theme/webpack.less');

module.exports = {
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

  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // Make whatever fine-grained changes you need
    // config.module.rules.push({
    //   test: /semantic\.less$/,
    //   use: ['style-loader', 'css-loader', 'less-loader'],
    // });

    config.module.rules.push(shared_loaders.semantic_less_loader);
    config.module.rules.push(shared_loaders.css_module_loader);
    config.module.rules.push(
      {
        resolve: {
          alias: {
            "@thecointech/utilities": "@thecointech/utilities/build",
            "@thecointech/contract": "@thecointech/contract/build",
            "@thecointech/shared": "@thecointech/shared/build",
            "@thecointech/site-base": "@thecointech/site-base/build",
            "@thecointech/site-semantic-theme": "@thecointech/site-semantic-theme/build",
          }
        }
      }
    );

    // Return the altered config
    return config;
  },
}
