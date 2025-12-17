import type { SecretKeyType } from '@thecointech/secrets/*';
import type webpack from 'webpack';
import { getDevConfig } from './webpack.dev.ts';
import { getProdConfig } from './webpack.prod.ts';

export function getConfig(secrets: SecretKeyType[], devServer: Partial<webpack.Configuration['devServer']>) {
  return process.env.NODE_ENV === 'production'
    ? getProdConfig(secrets)
    : getDevConfig(secrets, { devServer });
}
