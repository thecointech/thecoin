import { getSigner, type AccountName } from '@thecointech/signers';

// In some environments the address must be set
// statically (to support multiple hardware wallets)
// whereas in devlive the address is dynamically generated
// NOTE this contract lives here (contract-tools) because
// we don't have self-referencing in signers
export const getSignerAddress = async (name: AccountName) => {
  const envAddress = process.env[`WALLET_${name}_ADDRESS`];
  if (envAddress !== undefined) {
    return envAddress;
  }
  const signer = await getSigner(name);
  return await signer.getAddress();
}


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
