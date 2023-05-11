import { ConfigType } from './types';

export const getConfig = async () : Promise<ConfigType> => (await import(`./config.${
    process.env.CONFIG_ENV ?? process.env.CONFIG_NAME
  }.json`, { assert: { type: 'json' } })).default;
