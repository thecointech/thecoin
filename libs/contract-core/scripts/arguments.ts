import { getSignerAddress } from '@thecointech/contract-tools';

export async function getArguments(network: String) {
  return [
    await getSignerAddress("TheCoin"),
    network === 'polygon'
      // ChildChainManager calls the deposit function on the polygon chain
      // See https://static.matic.network/network/testnet/mumbai/index.json
      ? process.env.POLYGON_CHILDCHAIN_MANAGER
      : process.env.POLYGON_ROOTNET_PREDICATE ??
        "0xbaadf00dbaadf00dbaadf00dbaadf00dbaadf00d"
  ]
}
