// Important modules this config uses
import { join, resolve } from 'path';
import { merge } from "webpack-merge";
import HtmlWebpackPlugin from 'html-webpack-plugin';
import WebpackPwaManifest from 'webpack-pwa-manifest';
import CompressionPlugin from 'compression-webpack-plugin';
import { getBaseConfig } from './webpack.base';
import { signerConfig } from './webpack.signers';
import type { Configuration } from "webpack";
import type { SecretKeyType } from '@thecointech/secrets/*';

const prodOptions: Configuration = {
  mode: 'production',

  // In production, we skip all hot-reloading stuff
  entry: [
    join(process.cwd(), 'src/app.tsx'),
  ],

  // Utilize long-term caching by adding content hashes (not compilation hashes) to compiled assets
  output: {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].chunk.js',
  },

  optimization: {
    minimize: true,
    nodeEnv: 'production',
    sideEffects: true,
    concatenateModules: true,
    runtimeChunk: 'single',
    moduleIds: 'deterministic',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 10,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
            )[1];
            return `npm.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },

  plugins: [
    // Minify and optimize the index.html
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      favicon: 'src/images/favicon.ico',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      inject: true,
    }),

    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8,
    }),

    new WebpackPwaManifest({
      name: 'TheCoin',
      short_name: 'TheCoin',
      description: 'CO2-Neutrality without personal sacrifice',
      background_color: '#fafafa',
      theme_color: '#b1624d',
      inject: true,
      ios: true,
      icons: [
        {
          src: resolve('src/images/favicon.png'),
          sizes: [72, 96, 128, 144, 192, 384, 512],
        },
        {
          src: resolve('src/images/favicon.png'),
          sizes: [120, 152, 167, 180],
          ios: true,
        },
      ],
    }),
  ],

  performance: {
    assetFilter: assetFilename =>
      !/(\.map$)|(^(main\.|favicon\.))/.test(assetFilename),
  },
};

export async function getProdConfig(secrets: SecretKeyType[], overrides: Partial<Configuration>) {
  return merge(
    overrides,
    signerConfig,
    prodOptions,
    await getBaseConfig(secrets),
  )
}
