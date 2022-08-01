import { ConfigType } from './types';

export const getConfig = async () : Promise<ConfigType> => (await import(`./config.${
    process.env.CONFIG_ENV ?? process.env.CONFIG_NAME
  }.json`, { assert: { type: 'json' } })).default;

// NOTE!  for historical reasons this returns "1"
// for our mainnet - even though we are deployed to polygon
// This is because if we fixed it everyone would have to
// approve/link their account to the correct network,
// and I actually don't know what the point of this whole
// network thing is anyway.  Why on earth would it matter if we aren't
// putting information on the chain?
export const getChainId = () => (
  !process.env.DEPLOY_POLYGON_NETWORK_ID ||
  process.env.DEPLOY_POLYGON_NETWORK == "polygon-mainnet"
)
  ? 1
  : parseInt(process.env.DEPLOY_POLYGON_NETWORK_ID);
