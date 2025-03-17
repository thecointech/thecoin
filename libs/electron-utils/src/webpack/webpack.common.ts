import webpack from 'webpack';
import path, { join } from 'path';
import { getEnvFiles, getEnvVars } from '@thecointech/setenv';
import Dotenv from 'dotenv-webpack';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

export const configName = process.env.CONFIG_NAME ?? 'development';
const projectRoot = process.cwd();
export const configFile = join(projectRoot, 'tsconfig.build.json');
const envFiles = getEnvFiles(configName);
export const env = getEnvVars();
const packageFile = join(projectRoot, 'package.json');
const { version } = JSON.parse(readFileSync(packageFile, 'utf-8'));

export const commonBase: Partial<webpack.Configuration> = {
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(version),
      __APP_BUILD_DATE__: JSON.stringify(new Date()),
    }),
    ...envFiles.map(p => new Dotenv({
        path: fileURLToPath(p),
        ignoreStub: true
      })),
  ],
  resolve: {
    alias: {
      '@': path.join(projectRoot, 'src'),
    },
  },
};
