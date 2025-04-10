import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { mainConfig } from '@thecointech/electron-utils/webpack/webpack.main.config';
import { rendererConfig } from '@thecointech/electron-utils/webpack/webpack.renderer.config';
import path from 'path';
import { writeFileSync } from 'fs';


const mainConfigMerged = mainConfig({
  externals: [
    '@bitwarden/sdk-napi',
  ]
});

const config = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
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
      port: 3002,
      loggerPort: 9002,
    }),
  ],
  hooks: {
    postStart: async (config) => {
      console.log("postStart executing");
      const mainPackageJsonPath = path.join(".webpack", 'main', 'package.json'); // Adjust as needed
      writeFileSync(mainPackageJsonPath, JSON.stringify({ type: 'commonjs' }, null, 2));
    },
  },
};

export default config;
