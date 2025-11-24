// @ts-check
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { utils } from '@electron-forge/core';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import path from 'path';
import { writeFileSync } from 'fs';
import ForgeExternalsPlugin from '@timfish/forge-externals-plugin';
import { getCSP } from './csp.mjs';
import { getRendererConfig } from './webpack.renderer.mjs';
import { nativeModules, getMainConfig } from './webpack.main.mjs';

const deployedAt = JSON.stringify(new Date().toISOString());
const renderConfig = getRendererConfig(deployedAt);
const mainConfig = await getMainConfig(deployedAt);

const suffix = process.env.CONFIG_ENV === 'prod'
  ? ''
  : ` - ${process.env.CONFIG_NAME}`;

const config = {
  buildIdentifier: process.env.CONFIG_NAME,
  packagerConfig: {
    asar: false,
    // asar: {
    //   unpack: './node_modules/node-notifier/**/*'
    // },
    productName: "TheCoin - Harvester",
    icon: 'assets/appicon',
    appBundleId: utils.fromBuildIdentifier({
      prod: 'com.TheCoin.Harvester',
      prodbeta: 'com.TheCoin.Harvester', // This is the same as prod so you can't install both beta/prod
      prodtest: "com.TheCoin.Harvester.test",
      development: "com.TheCoin.Harvester.dev"
    }),
    artifactName: `harvester-${process.env.CONFIG_NAME}-{version}-{arch}.{ext}`,
    extraResource: [
      // Include our assets outside of the asar
      // file so we can reference them by absolute path
      './assets'
    ],
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
    new MakerZIP({}, ['darwin']), /*new MakerRpm({}),*/
    new MakerDeb({
      options: {
        icon: 'assets/appicon.png',
        name: `harvester${suffix.replaceAll(' ', '')}`,
        homepage: process.env.URL_SITE_LANDING,
        productName: `Harvester${suffix}`,
        genericName: `Harvester${suffix}`,
        categories: ['Utility'],
      }
    })
  ],
  plugins: [
    // new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      devContentSecurityPolicy: getCSP(),
      mainConfig: mainConfig,
      renderer: {
        config: renderConfig,
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
      const mainPackageJsonPath = path.join(".webpack", 'main', 'package.json'); // Adjust as needed
      writeFileSync(mainPackageJsonPath, JSON.stringify({ type: 'commonjs' }, null, 2));
    },
  }
};

// Only add externals when making/package/publish (not during any start)
const lifecycle = process.env.npm_lifecycle_event || '';
const isPackaging = /(make|package|publish)/.test(lifecycle);
if (isPackaging) {
  config.plugins.push(
    //@ts-ignore
    new ForgeExternalsPlugin({
      externals: nativeModules,
      includeDeps: true,
    })
  )
}

export default config;
