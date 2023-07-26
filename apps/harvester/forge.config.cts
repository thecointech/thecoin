import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './config/webpack.main.config';
import { rendererConfig } from './config/webpack.renderer.config';
import { getCSP } from './config/csp';

const config: ForgeConfig = {
  packagerConfig: {
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
    new WebpackPlugin({
      devContentSecurityPolicy: getCSP(),
      mainConfig,
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
