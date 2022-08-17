import { getSigner } from '@thecointech/signers';

// In some environments the address must be set
// statically (to support multiple hardware wallets)
// whereas in devlive the address is dynamically generated
const getNFTMinterAddress = async () => {
  if (process.env.WALLET_NFTMinter_ADDRESS !== undefined) {
    return process.env.WALLET_NFTMinter_ADDRESS;
  }
  const signer = await getSigner("NFTMinter");
  const address = await signer.getAddress();
  console.log(`NFTMinter address: ${address}`);
  return address;
}

export async function getArguments(network: String) {
  return [
    await getNFTMinterAddress(),
    network === 'ethereum'
      // ChildChainManager calls the deposit function on the polygon chain
      // See https://static.matic.network/network/testnet/mumbai/index.json
      ? '0x56E14C4C1748a818a5564D33cF774c59EB3eDF59'    // process.env.POLYGON_ROOTNET_PREDICATE
      : '0xb5505a6d998549090530911180f38aC5130101c6' ?? //process.env.POLYGON_CHILDCHAIN_MANAGER
        "0xbaadf00dbaadf00dbaadf00dbaadf00dbaadf00d"
  ]
}
