import { getSecret } from '@thecointech/secrets';
import webpack from 'webpack';
import { mainConfig } from '@thecointech/electron-utils/webpack/webpack.main.config';

// Native modules are marked as external and copied manually
// in the ForgeExternalsPlugin below.
export const nativeModules = [
  'leveldown',
  'onnxruntime-node',
  'sharp',
  'puppeteer',
  'puppeteer-extra',
  // These aren't used, but can cause warnings in
  // the forge logger main process if included
  '@bitwarden/sdk-napi',
  '@google-cloud/secret-manager',
]


export async function getMainConfig(deployedAt) {


  const mainPlugins = {
    ['process.env.TC_LOG_FOLDER']: JSON.stringify("false"),
    ['process.env.URL_SEQ_LOGGING']: JSON.stringify("false"),
    ['process.env.TC_DEPLOYED_AT']: deployedAt,
  }
  // Override the NODE_ENV from *.public.env files when debugging
  if (process.env.NODE_ENV) {
    mainPlugins['process.env.NODE_ENV'] = JSON.stringify(process.env.NODE_ENV);
  }

  // For proper builds
  const VqaSslCertPublic = await getSecret("VqaSslCertPublic");
  if (VqaSslCertPublic) {
    const VqaApiKey = await getSecret("VqaApiKey");
    const InfuraProjectId = await getSecret("InfuraProjectId");
    mainPlugins['__COMPILER_REPLACE_SECRETS__'] = JSON.stringify({
      VqaApiKey,
      InfuraProjectId,
      VqaSslCertPublic,
    });
  }

  const mainConfigMerged = mainConfig({
    plugins: [
      new webpack.DefinePlugin(mainPlugins),
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
  return mainConfigMerged;
}
