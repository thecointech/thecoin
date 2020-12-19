var shared_loaders = require('@the-coin/site-base/internal/webpack/webpack.less');

module.exports = {
  stories: [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
    "../apps/site-landing/stories/**/*.stories.@(js|jsx|ts|tsx)"
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
            "@the-coin/utilities": "@the-coin/utilities/build",
            "@the-coin/contract": "@the-coin/contract/build",
            "@the-coin/shared": "@the-coin/shared/build",
            "@the-coin/site-base": "@the-coin/site-base/build",
          }
        }
      }
    );

    // Return the altered config
    return config;
  },
}
