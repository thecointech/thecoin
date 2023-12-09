import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from '@thecointech/electron-utils/webpack/webpack.main.config';
import { rendererConfig } from '@thecointech/electron-utils/webpack/webpack.renderer.config';

import { getCSP } from './config/csp';
import { DefinePlugin } from 'webpack';

const mergedConfig = mainConfig({
  plugins: [
    new DefinePlugin({
      ['process.env.TC_LOG_FOLDER']: JSON.stringify("false"),
      ['process.env.URL_SEQ_LOGGING']: JSON.stringify("false"),
    })
  ],
})

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: 'assets/appicon',
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: 'assets/appicon.ico',
    }),
    new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      devContentSecurityPolicy: getCSP(),
      mainConfig: mergedConfig,
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

export default config;
