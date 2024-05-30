import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
// import { MakerRpm } from '@electron-forge/maker-rpm';
// import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from '@thecointech/electron-utils/webpack/webpack.main.config';
import { rendererConfig } from '@thecointech/electron-utils/webpack/webpack.renderer.config';

import { getCSP } from './config/csp';
import { DefinePlugin } from 'webpack';

const ForgeExternalsPlugin = require('@timfish/forge-externals-plugin')

const isBuild = process.env.npm_lifecycle_event != 'dev'

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
  externals: [
    'leveldown',
    'onnxruntime-node',
    'sharp',
    'puppeteer',
    'puppeteer-extra',
  ],
})

// @puppeteer/browsers needs to be expressly ignored because
// it will be copied by ForgeEternalsPlugin (as a dependency)
// but
const toCopy = [...mainConfigMerged.externals];
mainConfigMerged.externals.push( '@puppeteer/browsers')


const config: ForgeConfig = {
  packagerConfig: {
    asar: false,
    // asar: {
    //   unpack: './node_modules/node-notifier/**/*'
    // },
    // icon: 'assets/appicon',
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
      externals: toCopy,
      includeDeps: true,
    })
  )
}

export default config;
