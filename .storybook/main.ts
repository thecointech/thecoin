import type { StorybookConfig } from '@storybook/react-webpack5';
import path from 'path';
import webpack from 'webpack';
import { AbsolutePathRemapper } from '@thecointech/storybook-abs-paths';
import { merge } from "webpack-merge";

const rootFolder = path.join(__dirname, '..');
const mocksFolder = path.join(rootFolder, 'libs', '__mocks__');

const getAbsolutePath = (packageName: string) =>
  path.dirname(require.resolve(path.join(packageName, 'package.json')));

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.stories.@(ts|tsx)",
    "../libs/*/!(node_modules)/**/*.stories.@(js|jsx|ts|tsx)",
    "../apps/*/!(node_modules)/**/*.stories.@(js|jsx|ts|tsx)",
  ],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("storybook-react-intl"),
    getAbsolutePath("@storybook/addon-webpack5-compiler-babel"),
    getAbsolutePath("@storybook/addon-docs")
  ],

  webpackFinal: async (config) => {
    //@ts-ignore
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
          new webpack.DefinePlugin({ // Log Everything
            "process.env.LOG_NAME": JSON.stringify("Storybook"),
            "process.env.LOG_LEVEL": 0,
            "BROWSER": true,
          }),
          new AbsolutePathRemapper()
        ],
        experiments: {
          topLevelAwait: true,
        },
        resolve: {
          alias: {
            "fs": false,
            "path": false,
            "http": false,
          },
          modules: [mocksFolder],
        },
      },
      config);
    // Exclude our build folder from compilation.
    // This is because shared/site-base build to ES2017
    // which somehow breaks the FormatJS babel plugin.
    //@ts-ignore
    const babelRule = r.module?.rules?.find(rule => rule?.include?.includes?.(rootFolder));
    if (babelRule) {
      (babelRule as webpack.RuleSetRule).exclude = /(node_modules)|(build)/
    }
    return r;
  },

  framework: {
    name: getAbsolutePath("@storybook/react-webpack5") as "@storybook/react-webpack5",
    options: {}
  },

  docs: {},

  typescript: {
    reactDocgen: "react-docgen-typescript"
  }
}

export default config
