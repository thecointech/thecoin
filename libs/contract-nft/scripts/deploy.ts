import hre from 'hardhat';
import { getSigner } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';
import '@nomiclabs/hardhat-ethers';

async function main() {
  const network = "polygon"; //hre.network.name
  const name = getName(network);
  const owner = await getSigner("Owner");
  const {minter, depositor} = await getArguments(network)

  const TheGreenNFT = await hre.ethers.getContractFactory(name as "TheGreenNFTL2", owner);
  const theGreenNFT = await TheGreenNFT.deploy(minter, depositor);
  log.info(`Deployed ${name} at ${theGreenNFT.address}`);

  // Serialize our contract addresses
  storeContractAddress(new URL(import.meta.url), network, theGreenNFT.address);
}

const getName = (network: string) =>
  network === 'ethereum'
  ? "TheGreenNFTL1"
  : "TheGreenNFTL2";

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

async function getArguments(network: String) {
  return {
    minter: await getNFTMinterAddress(),
    depositor: network === 'ethereum'
      // ChildChainManager calls the deposit function on the polygon chain
      // See https://static.matic.network/network/testnet/mumbai/index.json
      ? '0x56E14C4C1748a818a5564D33cF774c59EB3eDF59'    // process.env.POLYGON_ROOTNET_PREDICATE
      : '0xb5505a6d998549090530911180f38aC5130101c6' ?? //process.env.POLYGON_CHILDCHAIN_MANAGER
        "0xbaadf00dbaadf00dbaadf00dbaadf00dbaadf00d"
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
