// @ts-check
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { utils } from '@electron-forge/core';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { mainConfig } from '@thecointech/electron-utils/webpack/webpack.main.config';
import { rendererConfig } from '@thecointech/electron-utils/webpack/webpack.renderer.config';
import { getCSP } from './config/csp.mjs';
import webpack from 'webpack';
import { getSecret } from '@thecointech/secrets';
import path from 'path';
import { writeFileSync } from 'fs';
import ForgeExternalsPlugin from '@timfish/forge-externals-plugin';

console.log("Loading Webpack");
// Native modules are marked as external and copied manually
// in the ForgeExternalsPlugin below.
const nativeModules = [
  'leveldown',
  'onnxruntime-node',
  'sharp',
  'puppeteer',
  'puppeteer-extra',
]

const vqaApiKey = await getSecret("VqaApiKey");

const mainConfigMerged = mainConfig({
  plugins: [
    new webpack.DefinePlugin({
      ['process.env.TC_LOG_FOLDER']: JSON.stringify("false"),
      ['process.env.URL_SEQ_LOGGING']: JSON.stringify("false"),
      ['process.env.VQA_API_KEY']: JSON.stringify(vqaApiKey),
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

const vqaCertificate = await getSecret("VqaSslCertPublic");
if (vqaCertificate) {
  mainConfigMerged.plugins.push(new webpack.DefinePlugin({
    ['process.env.VQA_SSL_CERTIFICATE']: JSON.stringify(vqaCertificate),
  }))
}

const config = {
  buildIdentifier: process.env.CONFIG_NAME,
  packagerConfig: {
    asar: false,
    // asar: {
    //   unpack: './node_modules/node-notifier/**/*'
    // },
    icon: 'assets/appicon',
    appBundleId: utils.fromBuildIdentifier({ beta: 'com.beta.harvester', prod: 'com.harvester' }),
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
  hooks: {
    postStart: async (config) => {
      console.log("postStart executing");
      const mainPackageJsonPath = path.join(".webpack", 'main', 'package.json'); // Adjust as needed
      writeFileSync(mainPackageJsonPath, JSON.stringify({ type: 'commonjs' }, null, 2));
    },
    // preStart: async (config) => {
    //   console.log("preStart executing");
    //   const mainPackageJsonPath = path.join(".webpack", 'main', 'package.json'); // Adjust as needed
    //   writeFileSync(mainPackageJsonPath, JSON.stringify({ type: 'commonjs' }, null, 2));
    // }
  }
};

// Only add in externals if packaging
if (process.env.npm_lifecycle_event != 'dev') {
  config.plugins.push(
    //@ts-ignore
    new ForgeExternalsPlugin({
      externals: nativeModules,
      includeDeps: true,
    })
  )
}

console.log("Finished")

export default config;
