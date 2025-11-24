import { rendererConfig } from '@thecointech/electron-utils/webpack/webpack.renderer.config';
import webpack from 'webpack';


export function getRendererConfig(deployedAt) {
  return rendererConfig({
    plugins: [
      new webpack.DefinePlugin({
        ['process.env.TC_DEPLOYED_AT']: deployedAt,
      })
    ],
    ignoreWarnings: [
      {
        message: /Conflicting values for 'process\.env\.TC_DEPLOYED_AT'/,
      },
    ],
  })
}
