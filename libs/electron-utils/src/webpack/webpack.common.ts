import { DefinePlugin } from 'webpack';
import { join } from 'path';
import { getEnvFiles, getEnvVars } from '@thecointech/setenv';
import Dotenv from 'dotenv-webpack';
import { fileURLToPath } from 'url';

export const configName = process.env.CONFIG_NAME ?? 'development';
const projectRoot = process.cwd();
export const configFile = join(projectRoot, 'tsconfig.build.json');
const packageFile = join(projectRoot, 'package.json');
const envFiles = getEnvFiles(configName);
export const env = getEnvVars();

export const commonPlugins = [
  new DefinePlugin({
    __VERSION__: JSON.stringify(require(packageFile).version),
    __APP_BUILD_DATE__: JSON.stringify(new Date()),
  }),
  ...envFiles.map(p => new Dotenv({
      path: fileURLToPath(p),
      ignoreStub: true
    })),
]
