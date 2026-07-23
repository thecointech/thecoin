import type { SecretKeyType } from '@thecointech/secrets';
import type webpack from 'webpack';
import { getDevConfig } from './webpack.dev.mts';
import { getProdConfig } from './webpack.prod.mts';

export function getConfig(secrets: SecretKeyType[], options: Partial<webpack.Configuration> = {}) {
  return process.env.NODE_ENV === 'production'
    ? getProdConfig(secrets, options)
    : getDevConfig(secrets, options);
}
