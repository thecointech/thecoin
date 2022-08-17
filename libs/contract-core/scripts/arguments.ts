import { getSigner } from '@thecointech/signers';

// In some environments the address must be set
// statically (to support multiple hardware wallets)
// whereas in devlive the address is dynamically generated
const getTheCoinAddress = async () => {
  if (process.env.WALLET_TheCoin_ADDRESS !== undefined) {
    return process.env.WALLET_TheCoin_ADDRESS;
  }
  const signer = await getSigner("TheCoin");
  const address = await signer.getAddress();
  console.log(`TheCoin address: ${address}`);
  return address;
}

export async function getArguments(network: String) {
  return [
    await getTheCoinAddress(),
    network === 'polygon'
      // ChildChainManager calls the deposit function on the polygon chain
      // See https://static.matic.network/network/testnet/mumbai/index.json
      ? process.env.POLYGON_CHILDCHAIN_MANAGER
      : process.env.POLYGON_ROOTNET_PREDICATE ??
        "0xbaadf00dbaadf00dbaadf00dbaadf00dbaadf00d"
  ]
}
