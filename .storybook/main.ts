import type { StorybookConfig } from '@storybook/react-webpack5';
import path from 'path';
import webpack from 'webpack';
import { AbsolutePathRemapper } from '@thecointech/storybook-abs-paths';
import { merge } from "webpack-merge";
import { getEnvVars, projectRoot as getProjectRoot } from '@thecointech/setenv';
import getMocks from '@thecointech/setenv/webpack';
import { DynamicAliasPlugin } from './resolver';
import { existsSync } from 'fs';

const rootFolder = path.join(__dirname, '..');
const mocksFolder = path.join(rootFolder, 'libs', '__mocks__');

const getAbsolutePath = (packageName: string) =>
  path.dirname(require.resolve(path.join(packageName, 'package.json')));

const envVarsRaw = {
  ...getEnvVars("development"),
  LOG_LEVEL: 0,
  LOG_NAME: "storybook",
  WALLET_CeramicValidator_DID: "did:ethr:0x1234567890123456789012345678901234567890",
}
const envVars = Object.entries(envVarsRaw).map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)]);

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

    // test imports jest-specific code, eg mocks
    if (config.resolve?.conditionNames) {
      config.resolve.conditionNames = config.resolve.conditionNames.filter(name => name != 'test');
    }

    const r = merge(
      getMocks({
        CONFIG_NAME: "development",
        NODE_ENV: "development",
      }),
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
            ...Object.fromEntries(envVars),
            "BROWSER": true,
          }),
          new AbsolutePathRemapper(),
        ],
        experiments: {
          topLevelAwait: true,
        },
        resolve: {
          alias: {
            "fs": false,
            "path": false,
            "http": false,
            "@jest/globals": false,
          },
          modules: [mocksFolder],
          conditionNames: ['development', 'browser', 'import', 'default'],
          plugins: [new DynamicAliasPlugin()],
        },
      },
      config);
    // Exclude our build folder from compilation.
    // This is because shared/site-base build to ES2017
    // which somehow breaks the FormatJS babel plugin.
    //@ts-ignore
    const babelRule = r.module?.rules?.find(rule => rule?.include?.includes?.(rootFolder));
    if (babelRule) {
      (babelRule as webpack.RuleSetRule).exclude = /(node_modules)|(build)|(\.(test|spec)\.(ts|tsx|js|jsx)$)/
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
