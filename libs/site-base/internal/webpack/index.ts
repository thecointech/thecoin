import type { SecretKeyType } from '@thecointech/secrets/*';
import type webpack from 'webpack';
import { getDevConfig } from './webpack.dev';
import { getProdConfig } from './webpack.prod';

export function getConfig(secrets: SecretKeyType[], devServer: Partial<webpack.Configuration['devServer']>) {
  return process.env.NODE_ENV === 'production'
    ? getProdConfig(secrets)
    : getDevConfig(secrets, { devServer });
}
