import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { utils } from '@electron-forge/core';
// import { MakerRpm } from '@electron-forge/maker-rpm';
// import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { mainConfig } from '@thecointech/electron-utils/webpack/webpack.main.config';
import { rendererConfig } from '@thecointech/electron-utils/webpack/webpack.renderer.config';

import { getCSP } from './config/csp';
import { DefinePlugin } from 'webpack';
import { getVqaCert } from './config/vqaCert';

const ForgeExternalsPlugin = require('@timfish/forge-externals-plugin')

// Native modules are marked as external and copied manually
// in the ForgeExternalsPlugin below.
const nativeModules = [
  'leveldown',
  'onnxruntime-node',
  'sharp',
  'puppeteer',
  'puppeteer-extra',
]

const mainConfigMerged = mainConfig({
  plugins: [
    new DefinePlugin({
      ['process.env.TC_LOG_FOLDER']: JSON.stringify("false"),
      ['process.env.URL_SEQ_LOGGING']: JSON.stringify("false"),
    })
  ],
  resolve: {
    fallback: {
      'bufferutil': false,
      'utf-8-validate': false,
    }
  },
  // The @puppeteer/browsers library will be copied
  // (as a dendency of puppeteer), however passing it
  // expressly results in errors being thrown.  We
  // avoid adding it to nativeModules array, but still
  // pass it here so webpack doesn't try and include it.
  externals: nativeModules.concat('@puppeteer/browsers'),
})

const vqaCert = getVqaCert();
if (vqaCert) {
  mainConfigMerged.plugins.push(new DefinePlugin({
    ['process.env.VQA_SSL_CERTIFICATE']: JSON.stringify(vqaCert),
  }))
}

const config: ForgeConfig = {
  buildIdentifier: process.env.CONFIG_NAME,
  packagerConfig: {
    asar: false,
    // asar: {
    //   unpack: './node_modules/node-notifier/**/*'
    // },
    icon: 'assets/appicon',
    appBundleId: utils.fromBuildIdentifier({ beta: 'com.beta.harvester', prod: 'com.harvester' }) as unknown as string
    // extraResource: [
    //   // Include our assets outside of the asar
    //   // file so we can reference them by absolute path
    //   './assets'
    // ],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: 'assets/appicon.ico',
    }),
    {
      name: '@electron-forge/maker-dmg',
      config: {
        icon: 'assets/appicon.icns',
        format: 'ULMO'
      }
    },
    new MakerZIP({}, ['darwin']), /*new MakerRpm({}),*/ new MakerDeb({})
  ],
  plugins: [
    // new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      devContentSecurityPolicy: getCSP(),
      mainConfig: mainConfigMerged,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
      port: 3004,
      loggerPort: 9004,
    }),
  ],
};

// Only add in externals if packaging
if (process.env.npm_lifecycle_event != 'dev') {
  config.plugins.push(
    new ForgeExternalsPlugin({
      externals: nativeModules,
      includeDeps: true,
    })
  )
}

export default config;
