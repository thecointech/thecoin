import webpack from 'webpack';
import path, { join } from 'path';
import { getEnvFiles, getEnvVars } from '@thecointech/setenv';
import Dotenv from 'dotenv-webpack';
import { fileURLToPath } from 'url';

export const configName = process.env.CONFIG_NAME ?? 'development';
const projectRoot = process.cwd();
export const configFile = join(projectRoot, 'tsconfig.build.json');
const envFiles = getEnvFiles(configName);
export const env = getEnvVars();

export const commonBase: Partial<webpack.Configuration> = {
  plugins: [
    ...envFiles.map(p => new Dotenv({
        path: fileURLToPath(p),
        ignoreStub: true,
        expand: true,
        systemvars: true,
      })),
  ],
  resolve: {
    alias: {
      '@': path.join(projectRoot, 'src'),
    },
  },
};
